import { faker } from "@faker-js/faker/locale/de";
import { OAuthAccountEntity } from "@fumix/fu-blog-server/dist/src/entity/OAuthAccount.entity.js";
import { UserEntity } from "@fumix/fu-blog-server/dist/src/entity/User.entity.js";
import express, { Router } from "express";
import { dataSource, userInfosById } from "../index.js";
import { UserInfo } from "../user-info.js";

const router: Router = express.Router();

router.get("/", async (req, res) => {
  const dbUserAccounts = await dataSource.manager.getRepository(OAuthAccountEntity).find({
    relations: ["user"],
  });
  // Put all the existing accounts from the DB into the userInfosById array
  dbUserAccounts.forEach((acc) => {
    const prev: Omit<UserInfo, "profile"> = userInfosById[acc.oauthId] ?? {
      code: faker.random.alphaNumeric(20),
    };

    userInfosById[acc.oauthId] = Object.assign(prev, {
      profile: {
        firstName: acc.user.firstName,
        lastName: acc.user.lastName,
        email: acc.user.email,
        profilePicture: acc.user.profilePicture,
      },
    });
  });
  const nonOauthDbUsers = await dataSource
    .createQueryBuilder(UserEntity, "u")
    .select()
    .leftJoin(OAuthAccountEntity, "o", "o.user_id = u.id")
    .where("o.id IS NULL")
    .getMany();

  const existingAccountHtml =
    '<ul class="row">' +
    dbUserAccounts
      .map((it) => {
        const pfp = userInfosById[it.oauthId].profile.profilePicture;
        const pfpDataUrl = pfp
          ? `<img src="data:image/png;base64,${Buffer.from(pfp).toString(
              "base64",
            )}" class="card-img-top" style="max-width: 6rem;margin: -3rem auto 0;border-radius: 2.5rem;"/>`
          : "";
        return `<li class="col-md-3" style="list-style:none;margin-top:4rem">
          <div class="card">
            ${pfpDataUrl}
            <form method="get" action="${req.query.redirect_uri}" class="card-body">
              <span>ID <code>${it.oauthId}</code></span><br>
              <span>${userInfosById[it.oauthId].profile.firstName} ${userInfosById[it.oauthId].profile.lastName} </span><br>
              <span>Code <code>${userInfosById[it.oauthId].code}</code></span><br>
              <a class="btn btn-outline-primary" href="${req.query.redirect_uri}?state=${req.query.state ?? ""}&code=${
          userInfosById[it.oauthId].code
        }">Login</a>
            </form>
          </div>
        </li>`;
      })
      .join("") +
    "</ul>";

  const nonOAuthUsersHTML =
    '<ul class="row">' +
    nonOauthDbUsers.map((acc) => {
      const pfp = acc.profilePicture;
      const pfpDataUrl = pfp
        ? `<img src="data:image/png;base64,${Buffer.from(pfp).toString(
            "base64",
          )}" class="card-img-top" style="max-width: 6rem;margin: -3rem auto 0;border-radius: 2.5rem;"/>`
        : "";
      return `<li class="col-md-3" style="list-style: none;margin-top:4rem">
        <div class="card">
          ${pfpDataUrl}
          <form method="post" action="?" class="card-body">
            <div class="form-floating mb-2">
              <input id="userId" name="userId" class="form-control" placeholder required value="${faker.random.alphaNumeric(20)}">
              <label for="userId">User-ID</label>
            </div>
            <div class="form-floating mb-2">
              <input id="code" name="code" class="form-control" placeholder required value="${faker.random.alphaNumeric(20)}">
              <label for="userId">Code</label>
            </div>
            <input name="firstName" value="${acc.firstName ?? ""}" readonly class="form-control-plaintext">
            <input name="lastName" value="${acc.lastName ?? ""}" readonly class="form-control-plaintext">
            <input name="email" value="${acc.email}" readonly class="form-control-plaintext">
            <input type="hidden" value="${req.query.state ?? ""}" name="state" readonly/>
            <input type="submit" value="Login" class="btn btn-outline-primary"/>
          </form>
        </div>
      </li>`;
    }) +
    "</ul>";

  const redirectUri = (req.query.redirect_uri ?? "") + "";
  if (!redirectUri || !redirectUri.match(/^https?:\/\//)) {
    res.status(400).json({ error: "Query parameter redirect_uri missing!" });
  } else {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName);
    res
      .status(200)
      .contentType("text/html")
      .send(
        `<!DOCTYPE html>
<link rel="stylesheet" href="/bootstrap.min.css">
<script src="/bootstrap.bundle.js"></script>
<title>Login</title>
<div class="container">
  <h1 class="mt-5">Login</h1>
  <h2>Linked accounts in DB</h2>
  ${existingAccountHtml}
  <h2>Unlinked accounts in DB</h2>
  ${nonOAuthUsersHTML}

  <h2>Create custom login</h2>
  <form method="post">
    <div class="form-floating mb-2">
      <input id="userId" name="userId" class="form-control" type="text" placeholder required value="${faker.random.alphaNumeric(20)}">
      <label for="userId">User-ID</label>
    </div>
    <div class="form-floating mb-2">
      <input id="email" name="email" class="form-control" type="text" placeholder required value="${email}">
      <label for="email">E-Mail</label>
    </div>
    <div class="form-floating mb-2">
      <input id="firstName" name="firstName" class="form-control" type="text" placeholder value="${firstName}">
      <label for="firstName">First name</label>
    </div>
    <div class="form-floating mb-2">
      <input id="lastName" name="lastName" class="form-control" type="text" placeholder value="${lastName}">
      <label for="lastName">Last name</label>
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
        <input id="code" name="code" class="form-control" type="text" value="${faker.random.alphaNumeric(20)}" pattern="[a-zA-Z0-9_-]+">
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
  </form>
</div>`,
      );
  }
});
router.post("/", (req, res) => {
  saveUser(req.body.userId, req.body.code, req.body.firstName, req.body.lastName, req.body.email);
  res.status(302).redirect(`${req.body.redirectUri}?code=${encodeURIComponent(req.body.code)}&state=${encodeURIComponent(req.body.state)}`);
});

function saveUser(userId: string, code: string, firstName: string, lastName: string, email: string) {
  userInfosById[userId] = {
    code,
    profile: {
      firstName,
      lastName,
      email,
    },
  };
}

export default router;
