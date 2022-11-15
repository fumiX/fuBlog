## TypeORM

To create a new migration use the following:

`npx typeorm migration:create src/migration/MigrationName`

All entities are currently run automatically upon starting the node server. To change this, set the `migrationsRun: true`-Flag to false.

- Entities: `./src/entity/`

- Datasource configuration: `./src/data-source.ts`

- Example usage of the entity manager: `await AppDataSource.manager.getRepository(Post)`