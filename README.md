# ![fumiX blog icon](./client/src/assets/favicon/favicon.svg) fuBlog
![Build status of main branch](https://img.shields.io/github/actions/workflow/status/FumiX/fuBlog/build.yml?style=flat-square&branch=main)
![Version in package.json](https://img.shields.io/github/package-json/v/FumiX/fuBlog?style=flat-square&label=package.json)
![Latest git tag](https://img.shields.io/github/v/tag/FumiX/fuBlog?style=flat-square&include_prereleases&sort=semver&label=git%20tag)
![Latest GitHub release](https://img.shields.io/github/v/release/FumiX/fuBlog?style=flat-square&include_prereleases&sort=semver&label=GitHub%20release)
![License recognized by GitHub](https://img.shields.io/github/license/FumiX/fuBlog?style=flat-square)


A blog software written in Typescript, with an Express.js backend and a Vue3 frontend.

## Requirements
* git
* Node 18 & NPM 8

## Preparations

### General

Unless otherwise stated, all commands should be executed in the
root directory of the project.


```bash
npm install
```

### IntelliJ

In case you develop in an IntelliJ IDE, you can initialize or override your IDE settings
with useful defaults by doing this:
```bash
# It's good practice to commit any uncommitted changes before doing this,
# so nothing is lost (should generally be safe, but not guaranteed)
git restore --overlay --source intellij .
```
Takes the contents of the [`intellij` branch](https://github.com/fumiX/fuBlog/tree/intellij)
and overlays these files on the current worktree.

If you don't have a local copy of that branch, try replacing `intellij` with `origin/intellij`.

## Full build of the project
```bash
npm run build
```

## Start the server and vue3 client for development
```bash
npm start
```

## Starting a task in the subprojects

The project consists of three subprojects (in NPM terminology “workspaces”):
[client](./client/), [server](./server/), [common](./common/)

NPM scripts of these workspaces can be run like this:
```bash
# Runs task ‹taskName› in ‹workspaceName› (`--workspace` can be shortened to `-w`)
npm run --workspace ‹workspaceName› ‹taskName›
# Runs task ‹taskName› in all workspaces (`--workspaces` can be shortened to `-ws`)
npm run --workspaces ‹taskName›
```
