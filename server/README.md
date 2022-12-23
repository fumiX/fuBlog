## Common ##

### Managing environment variables ###

  * To load environment variables into the application we use an external library - [dotenv](https://www.npmjs.com/package/dotenv) `npm install dotenv`
  * It relies on a file called `.env` where the key-value pairs are defined.
  * We also use node's / ts-node's  `--require (-r)` command line option to preload the library. By doing this we do not need to load dotenv in our applicaion - 
	thus `require("dotenv")` or `import dotenv from "dotenv"` is not necessary.
  * We provide an environemt variables declaration file called `env.template`.
  * Copy `.env.template` to `.env` and provide your own valid values.
  * Your scripts must be adapted correspondingly `ts-node -r dotenv/config your-script.js`
  
## TypeORM

To create a new migration use the following:

`npx typeorm migration:create src/migration/MigrationName`

All entities are currently run automatically upon starting the node server. To change this, set the `migrationsRun: true`-Flag to false.

- Entities: `./src/entity/`

- Datasource configuration: `./src/data-source.ts`

- Example usage of the entity manager: `await AppDataSource.manager.getRepository(Post)`

## OAuth ##
  * We use `npm install openid-client` [openid-client](https://www.npmjs.com/package/openid-client)
