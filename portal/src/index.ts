import { AppDataSource } from "@fumix/fu-blog-server/dist/data-source.js";
import { X509Certificate } from "crypto";
import express from "express";
import { readFileSync } from "fs";
import type { ServerOptions } from "https";
import * as https from "https";
import { Certificate, createCert } from "mkcert";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import loginRoute from "./routes/login.js";
import tokenRoute from "./routes/token.js";
import userinfoRoute from "./routes/userinfo.js";
import { UserInfo } from "./user-info.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const port = 5030;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

export const userInfosById: { [oauthId: string]: UserInfo } = {};

const authorizationPath = "/login";
const tokenPath = "/token";
const userinfoPath = "/userinfo";

app.use(authorizationPath, loginRoute);
app.use(tokenPath, tokenRoute);
app.use(userinfoPath, userinfoRoute);

app.get("/favicon.ico", (req, res) => {
  res.status(404).send();
});

app.get("/bootstrap.min.css", (req, res) => {
  res //
    .status(200)
    .contentType("text/css")
    .sendFile(path.join(__dirname, "..", "..", "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css"));
});
app.get("/bootstrap.bundle.js", (req, res) => {
  res //
    .status(200)
    .contentType("application/javascript")
    .sendFile(path.join(__dirname, "..", "..", "node_modules", "bootstrap", "dist", "js", "bootstrap.bundle.js"));
});

app.get("/.well-known/openid-configuration", (req, res) => {
  res
    .status(200)
    .contentType("application/json")
    .json({
      issuer: `https://localhost:${port}`,
      authorization_endpoint: `https://localhost:${port}${authorizationPath}`,
      token_endpoint: `https://localhost:${port}${tokenPath}`,
      grant_types_supported: ["authorization_code"],
      response_types_supported: ["code", "token", "id_token"],
      token_endpoint_auth_methods_supported: ["client_secret_post"],
      userinfo_endpoint: `https://localhost:${port}${userinfoPath}`,
      scopes_supported: ["openid", "email", "profile"],
    });
});

export const dataSource = await AppDataSource.initialize();

app.get("/*", async (req, res) => {
  console.log("Unmatched GET request", req.path, req.headers, req.body);

  res.status(404).json({});
});
app.post("/*", (req, res) => {
  console.log("Unmatched POST request", req.path, req.headers, req.body);
  res.status(404).json({});
});

const serverOptions: ServerOptions = {
  ...(await createCertificate()),
};

https.createServer(serverOptions, app).listen(5030, () => {
  console.log(`Login portal listening on port ${port}`);
});

async function createCertificate(): Promise<Certificate> {
  const caCrtPath = path.join(__dirname, "/../../certs/ca.crt");
  const caKeyPath = path.join(__dirname, "/../../certs/ca.key");

  try {
    const caCert = readFileSync(caCrtPath, { encoding: "utf-8" });
    const caKey = readFileSync(caKeyPath, { encoding: "utf-8" });
    const cert = await createCert({
      domains: ["127.0.0.1", "localhost"],
      validity: 7,
      ca: {
        cert: caCert,
        key: caKey,
      },
    });
    console.log("Created cert valid until", new X509Certificate(cert.cert).validTo);
    return cert;
  } catch (e) {
    console.error(e);
    throw new Error(
      `No certificate authority found! Please generate ${caCrtPath} and ${caKeyPath} by running the npm script 'generate-ca'!`,
    );
  }
}
