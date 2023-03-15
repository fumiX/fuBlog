> [Docs](../README.md) › [OAuth](./README.md) › **Gitlab**

# Gitlab
> This OAuth provider is currently not fully supported. Login might not work yet.

1. Go to https://gitlab.com/-/profile/applications
   1. Enter a name for the application
   2. Set `http://localhost:5010/login` as the redirect URI
   3. enable the checkbox "Confidential"
   4. Enable the checkboxes for the scopes `openid`, `profile` and `email`
   5. Save the application
2. Set the environment variables in [`server/.env`](../../server/.env)
   1. **For GitLab.com only:**
      1. Put the displayed application ID into `OAUTH_GITLAB_CLIENT_ID`
      2. Put the application secret into `OAUTH_GITLAB_CLIENT_SECRET`
   2. **For self-hosted GitLab only:** (replace `n` with an integer >= 1)
      1. Put the displayed application ID into `OAUTH_GITLAB_n_CLIENT_ID`
      2. Put the application secret into `OAUTH_GITLAB_n_CLIENT_SECRET`
      3. Put the domain used for the GitLab instance into `OAUTH_GITLAB_n_DOMAIN`
