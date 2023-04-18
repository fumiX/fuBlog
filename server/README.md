## Environment Variables ##

### Accessing environment variables within the application (client / server) ###

  * To load environment variables into the application we use an external library - [dotenv](https://www.npmjs.com/package/dotenv)
  * Install it `npm install dotenv`
  * It relies on a file called `.env` where the key-value pairs are defined.
  * We also use node's / ts-node's  `--require (-r)` command line option to preload the library. By doing this we do not need to load dotenv in our applicaion -
  thus `require("dotenv")` or `import dotenv from "dotenv"` is not necessary.
  * We provide an environment variables declaration file called `env.template`.
  * Copy `.env.template` to `.env` and provide your own valid values.
  * Your scripts must be adapted correspondingly `ts-node -r dotenv/config your-script.js`

### Using IntelliJ to manage environment variables ###
  * The values of some variables may depend on the current mode **development / production**.
  * The application is in development mode if the value of `NODE_ENV` is **development**
  * IntelliJ enables the management of environment variables for each run configuration.
  * Just open *Edit Configurations...* and add a new key value entry within the *Environment* input field - `NODE_ENV=development` for
    example.

## TypeORM

To create a new migration use the following:

`npx typeorm migration:create server/src/migration/MigrationName`

All entities are currently run automatically upon starting the node server. To change this, set the `migrationsRun: true`-Flag to false.

- Entities: `./src/entity/`

- Datasource configuration: `./src/data-source.ts`

- Example usage of the entity manager: `await AppDataSource.manager.getRepository(Post)`

## OAuth ##
  * We use `npm install openid-client` [openid-client](https://www.npmjs.com/package/openid-client)
