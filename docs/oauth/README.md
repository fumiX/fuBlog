> [Docs](../README.md) › **OAuth**

# OAuth

Using the different OAuth providers requires a bit of preparations, usually to create an OAuth application for that provider.

The login portal should be the easiest option for local development. It allows you to use fake user accounts, but is only available with `NODE_ENV=development`.

* [Login portal](./Portal.md)
* [Google](./Google.md)
* [GitLab](./Gitlab.md)

## Login flow

```mermaid
sequenceDiagram
participant BS as Browser storage
actor User
participant BW as Browser window
participant App as App server
participant OAuth as OAuth server

autonumber

rect rgb(255,240,240)
  note right of BS: Our login page
  User->>BW: Go to blog.fumix.de
  BW->>+App: GET /
  App->>-BW: HTML page with Vue app
  activate BW
  BW->>+App: POST /api/auth/providers
  App->>-BW: JSON providers list
  BW->>+BS: Generate random state and save for later
  note over BS: sessionStorage:<br>state, redirectPath
  BW->>-User: Show Links to OAuth providers
  User->>BW: Click login link
end

rect rgb(240,255,240)
  note right of User: Login page of the OAuth provider
  BW->>+OAuth: GET /login
  OAuth->>-BW: HTML login form
  activate BW
  BW->>User: Show login form
  User->>BW: Enter login credentials
  BW->>+OAuth: POST login credentials
  deactivate BW
  OAuth->>-BW: Redirect to blog.fumix.de/login
end

rect rgb(240,240,255)
  note right of BS: Get JWT token
  BW->>+App: GET /login
  App->>-BW: HTML login page
  activate BW
  BW->>BS: Check if state matches
  BS->>BW: On match: continue<br>Else: Show error with link for user to try again
  deactivate BS
  BW->>+App: POST /api/auth/userinfo
  App->>+OAuth: POST Token endpoint
  OAuth->>-App: ID token, access token
  App->>App: Check if user exists in DB
  App->>+OAuth: POST Userinfo endpoint
  OAuth->>-App: Userinfo
  App->>-BW: Userinfo, Tokens
  alt new user, not yet in DB
    BW->>User: Show form to create user
    User->>BW: Fill in name and username
    BW->>+App: POST /api/auth/userinfo/register
    App->>+OAuth: POST Userinfo endpoint
    OAuth->>-App: Userinfo
    App->>App: Put new user in DB
    App->>BW: Userinfo
  end
  BW->>+BS: save ID token (JWT), OAuth type and issuer
  note over BS: localStorage:<br>id_token,<br>oauth_type, oauth_issuer
end

rect rgb(255,255,230)
  note right of BS: Make authenticated API request
  BW->>BS: Get JWT token
  BS->>BW: Token
  BW->>+App: GET /api/post/create<br>(JWT token in Authorization header)
  App->>App: Check JWT token and refresh if needed
  alt not authenticated
    App->>BW: HTTP redirect to app.com/login<br>goto ②
  else no permission
    App->>BW: Return error
  else else
    App->>-BW: Return response
  end
end

deactivate BW
deactivate BS
```
