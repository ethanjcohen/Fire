const clone = require('git-clone'),
        c = require('config').get('fireConfig.server'),
        middleware = require('./middleware'),
        bodyParser = require('body-parser'),
        http = require('http'),
        tag = 'Server: ',
        express = require('express'),
        app = express(),
        server = http.createServer(app),
        router = express.Router(),
        port = c.get('port') || 80;

var isRouterSetup = false,
    preMiddleware = [];

function setupRouter()
{
    if(isRouterSetup) { return }

    isRouterSetup = true

    router.use(bodyParser.json())

    if(preMiddleware.length > 0)
    {
        router.use.apply(router, preMiddleware)
    }

    if(c.manualRefresh !== false)
    {
        console.log(tag, 'ENABLED - Manual Refresh')
        router.get('/refresh',                 middleware.refreshConfig)
    }

    if(c.webhooks.bitbucket)
    {
        console.log(tag, 'ENABLED - BitBucket Webhook')
        router.post('/webhooks/bitbucket',  middleware.validateBitbucketPullRequest, middleware.refreshConfig)
    }

    if(c.webhooks.github)
    {
        console.log(tag, 'ENABLED - GitHub Webhook')
        router.post('/webhooks/github',  middleware.validateGithubPullRequest, middleware.refreshConfig)
    }

    router.get('/config/:instance',        middleware.getConfig)
    router.get('/config/:instance/:env',   middleware.getConfig)

    if(c.path != null)
    {
        app.use(c.path, router);
    }
    else
    {
        app.use(router);
    }
}

function start(cb)
{
    cb = cb || function(){}

    var didReturn = false;

    setupRouter();

    server.on('error', function(err)
    {
        if(didReturn)
        {
            return;
        }

        didReturn = true;
        console.error(tag, 'Error: ' + err.message)
        return cb(err)
    })

    server.listen(port, function(err)
    {
        if(err)
        {
            console.error(tag, 'Error: ' + err.message)
        }
        else
        {
            console.log(tag, 'Listening on port: ' + port)
        }

        didReturn = true;

        return cb(err)
    })
}

function stop(cb)
{
    cb = cb || function(){}

    server.close(function(err)
    {
        if(err)
        {
            console.error(tag, 'Error: ' + err.message)
        }
        else
        {
            console.log(tag, 'Stopped')
        }

        return cb(err)
    })
}

module.exports = {
    start: start,
    stop: stop,
    use: function()
    {
        Array.prototype.push.apply(preMiddleware, arguments)
    },
    getPort: function()
    {
        return port;
    }
}
