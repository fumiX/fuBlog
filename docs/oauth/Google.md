> [Docs](../README.md) › [OAuth](./README.md) › **Google**

# Setup OAuth with Google

1. Go to https://console.cloud.google.com/projectcreate , choose a project name and create that project.
2. Make sure that the newly created project is from now on selected in the dropdown on the top left of the page
3. Go to https://console.cloud.google.com/apis/credentials/consent to create a consent screen
   1. Choose „external“, except if you want to limit the app to just your organization.
   2. Fill in the required fields with name and contact info for your app
   3. Scopes can be skipped
   4. If needed, add additional test users for testing
4. Go to https://console.cloud.google.com/apis/credentials/oauthclient to create OAuth credentials for the app
   1. Choose „Web application“
   2. Choose a name for the app client
   3. Create the credentials, copy the client ID and client secret that are displayed into the file [`server/.env`](../../server/.env) as `OAUTH_GOOGLE_CLIENT_ID` and `OAUTH_GOOGLE_CLIENT_SECRET`
