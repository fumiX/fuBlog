> [Docs](../README.md) › **Deployment**

# Deployment

## One time setup
1. Copy the file [docker/compose/docker-compose.yml](../../docker/compose/docker-compose.yml) into your deployment directory
2. Copy the file [docker/compose/.env.template](../../docker/compose/.env.template) into the same directory
   1. rename it as `.env`
   2. fill in the variables with the correct values

## Update to next version

1. Update the version number in all `package.json` files to the new version, commit and push everything to GitHub
2. Create a git tag: `git tag -a v1.2.3` and push to GitHub as well
3. Wait until the version is published to https://github.com/fumiX/fuBlog/pkgs/container/fublog-app
4. Do a `docker compose pull` in the deployment directory

## Start

```shell
docker compose up -d
```
