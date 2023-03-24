# Docker

## Start the published docker image

Start the docker image published to [ghcr.io/fumix/fublog-app:main](https://github.com/fumiX/fuBlog/pkgs/container/fublog-app),
connects it with [ghcr.io/fumix/fublog-postgres:main](https://github.com/fumiX/fuBlog/pkgs/container/fublog-app):

```bash
cd ../../
docker compose -f docker-compose.production.yml up -d
```

The app can be accessed via http://localhost:5100

The above command won't automatically re-download newer versions of the docker images.
You can update the docker images to the latest published version by running this:
```bash
docker compose -f docker-compose.production.yml pull
```
