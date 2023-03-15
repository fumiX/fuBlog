> [Docs](../README.md) › [OAuth](./README.md) › **Login portal**

# Login portal

By default, a login portal is started up at [http**s**://localhost:5030](https://localhost:5030).

As soon as `npm start` was executed for the first time, you'll find the CA certificate used in the portal in the file [$projectDir/certs/ca.crt](../../certs/ca.crt).

Import this self-signed CA certificate into your browser, so it no longer warns you about an invalid certificiate issuer.

Then you should be able to login via the login portal by clicking the button „Login via localhost:5030“.
