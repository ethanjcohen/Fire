# Fire
A simple config server - spread your configs like fire!

![](https://raw.githubusercontent.com/ethanjcohen/Fire/master/images/overview.png "Fire server")

## Usage

### Standalone Server
1. Clone this repo
2. npm install
3. node start

![](https://raw.githubusercontent.com/ethanjcohen/Fire/master/images/node-start.png "Overview")

### Node Module
Use Fire as a module in your custom script to fully integrate it with other systems and automation tools.
```
npm install https://github.com/ethanjcohen/Fire.bit
```
```javascript
var fire = require('fire-config'),
    server = fire.server,
    configs = fire.configs;

configs.events.on('refreshed', function() {
    //notify your system that new configs are available
})

server.start(function(err) {
    if(!err) {
        //The REST API server is now running

        //Refresh the configs from our repo
        configs.refresh()
    }
})
```

## What?
Fire is a config server. Initialize your code by fetching configs from it using a simple REST API.

Built on top of the wonderful [config node library](https://www.npmjs.com/package/config), Fire is very flexible.

## Why?
I love the flexibility of config, but it has some problems when considering deployment and management of a distributed system with multiple environments:

1. Changing the config involves updating the config files on all servers
2. The config is embeded in the code project, which adds risk and reduces flexibility

Fire is simply a wrapper around the config library - which allows you to take full advantage of config's features without hindering your distributed systems.

## How?
Fire pulls config files directly from your Git repo. Your team members update the config via pull requests. Fire automatically refreshes its configs when a pull request is merged.

## REST API

| Method        | URI           | Description  |
| ------------- |-------------| -----|
| GET      | /config/:instance | Retrieves the default config for the instance |
| GET      | /config/:instance/:environment      |   Retrieves the config for the specified instance + environment |
| GET      | /refresh      |   Force a config refresh |
| POST      | /webhooks/github      |   Trigger a refresh via a GitHub webhook request |
| POST      | /webhooks/bitbucket      |   Trigger a refresh via a BitBucket webhook request |

Examples:

GET /config/todoapp (default config)

GET /config/todoapp/production

GET /config/todoapp/qa

## Options
To modify options: Create a local.json5 file and override any values seen below.

| Name | Default Value | Description |
| --- | --- | --- |
| server.port | 80 | The port that the REST API listens to
| server.refreshOnStart | true | True to refresh configs on startup
| server.manualRefresh | true | True to enable the GET /refresh path
| server.webhooks.bitbucket | null | Set this value as an object to enable GET /webhooks/bitbucket 
| server.webhooks.bitbucket.mergeInto | null | The branch name that the pull request must be merged into to trigger a refresh
| server.webhooks.github | null | Set this value as an object to enable GET /webhooks/github 
| server.webhooks.github.mergeInto | null | The branch name that the pull request must be merged into to trigger a refresh
| configs.configsDir | 'config' | The directory inside the repo that contains the config files
| configs.useInstanceDirs | false | True if your config files are separated into directories for each instance name (i.e. /config/todoapi, /config/todowebsite)
| git.repo | null | The value passed to "git clone --repo {value}"
| git.username | null | (optional) Will be inserted into the git.repo value
| git.password | null | (optional) Will be inserted into the git.repo value
| git.checkout | null | The branch name, commit, etc to checkout. This is the value passed to "git checkout {value}"
