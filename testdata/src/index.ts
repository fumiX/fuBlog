import { bytesToBase64URL } from "@fumix/fu-blog-common";
import * as crypto from "crypto";
import { X509Certificate } from "crypto";
import express from "express";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import * as https from "https";
import { createCert } from "mkcert";
import * as path from "path";
import { dirname } from "path";

import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const usersByCodeDir = path.join(__dirname, "..", "dist", "usersByCode");

const port = 5030;

const caCertPath = `${__dirname}/../certs/ca.crt`;
const caKeyPath = `${__dirname}/../certs/ca.key`;
let cert;
try {
  const caCert = readFileSync(caCertPath);
  const caKey = readFileSync(caKeyPath);
  cert = await createCert({
    domains: ["127.0.0.1", "localhost"],
    validityDays: 7,
    caCert,
    caKey,
  });
  console.log("Created cert valid until", new X509Certificate(cert.cert).validTo);
} catch (e) {
  console.error(e);
  throw new Error(`No certificate authority found! Please generate ${caCertPath} and ${caKeyPath} by running the npm script 'gen-ca'!`);
}

const app = express();
app.use(express.urlencoded());

const authorizationPath = "/login";
const tokenPath = "/token";

app.get(authorizationPath, (req, res) => {
  const codeBytes = new Uint8Array(12);
  crypto.getRandomValues(codeBytes);
  const code = bytesToBase64URL(codeBytes);

  const users = readdirSync(usersByCodeDir)
    .filter((it) => it.endsWith(".json"))
    .map((filename) => JSON.parse(readFileSync(path.join(usersByCodeDir, filename), { encoding: "utf8" })));

  const redirectUri = (req.query.redirect_uri ?? "") + "";
  if (!redirectUri || !redirectUri.match(/^https?:\/\//)) {
    res.status(400).json({ error: "Query parameter redirect_uri missing!" });
  } else {
    res
      .status(200)
      .contentType("text/html")
      .send(
        `<!DOCTYPE html>
<link rel="stylesheet" href="/bootstrap.min.css">
<title>Login</title>
<div class="container">
  <form method="post">
    <h1 class="mt-5">Login</h1>
    <div class="form-floating mb-2">
      <input id="userId" name="userId" class="form-control" type="text" placeholder required>
      <label for="userId">User-ID</label>
    </div>
    <div class="form-floating mb-2">
      <input id="email" name="email" class="form-control" type="text" placeholder required>
      <label for="email">E-Mail</label>
    </div>
    <input class="btn btn-primary btn-lg" type="submit" value="Anmelden">


    <details>
      <summary>OAuth-Parameter</summary>
      <div class="form-floating mb-4">
        <input id="state" name="state" class="form-control" type="text" value="${req.query.state ?? ""}">
        <label for="state">State</label>
        <div class="form-text">
          Arbitrary string that is passed from the app to the OAuth provider (this page) and then passed back to the app.<br>
          The app should abort the login process if this is changed in any way.
        </div>
      </div>
      <div class="form-floating mb-4">
        <input id="code" name="code" class="form-control" type="text" value="${code}" pattern="[a-zA-Z0-9_-]+">
        <label for="code">Code</label>
        <div class="form-text">
          Arbitrary string, under which the user info is saved. It is generated randomly.
          You can change it to different values if you need it to be a certain value (overrides previous logins that used the same code).
        </div>
      </div>
      <div class="form-floating mb-4">
        <input id="redirectUri" name="redirectUri" class="form-control" type="text" value="${req.query.redirect_uri ?? ""}">
        <label for="redirectUri">Redirect-URI</label>
        <div class="form-text">The URI that this page will redirect you to after submitting the form.</div>
      </div>
    </details>
    <details>
      <summary>Previous user logins</summary>
      <pre>
${JSON.stringify(users, null, 2)}
      </pre>
    </details>
  </form>
</div>
`,
      );
  }
});
app.post(authorizationPath, (req, res) => {
  mkdirSync(usersByCodeDir, { recursive: true });
  writeFileSync(path.join(usersByCodeDir, req.body.code + ".json"), JSON.stringify(req.body));
  res.status(302).redirect(`${req.body.redirectUri}?code=${encodeURIComponent(req.body.code)}&state=${encodeURIComponent(req.body.state)}`);
});

app.get("/bootstrap.min.css", (req, res) => {
  res //
    .status(200)
    .contentType("text/css")
    .sendFile(path.join(__dirname, "..", "..", "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css"));
});

app.get("/.well-known/openid-configuration", (req, res) => {
  res
    .status(200)
    .contentType("application/json")
    .json({
      issuer: `https://localhost:${port}`,
      authorization_endpoint: `https://localhost:${port}${authorizationPath}`,
      token_endpoint: `https://localhost:${port}${tokenPath}`,
      response_types_supported: ["code"],
    });
});
app.get("/*", (req, res) => {
  console.log("Unmatched GET request", req.path, req.headers, req.body);
  res.status(404).json({});
});
app.post("/*", (req, res) => {
  console.log("Unmatched POST request", req.path, req.headers, req.body);
  res.status(404).json({});
});

https
  .createServer(
    {
      key: cert.key,
      cert: cert.cert,
    },
    app,
  )
  .listen(5030, () => {
    console.log(`Test data portal listening on port ${port}`);
  });
