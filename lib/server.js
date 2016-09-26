const clone = require('git-clone'),
        c = require('config').get('server'),
        middleware = require('./middleware'),
        express = require('express'),
        port = c.get('port') || 80,
        bodyParser = require('body-parser'),
        app = express(),
        http = require('http'),
        server = http.createServer(app),
        tag = 'Server: ';

app.use(bodyParser.json())

if(c.manualRefresh !== false)
{
    console.log(tag, 'ENABLED - Manual Refresh')
    app.get('/refresh',                 middleware.refreshConfig)
}

if(c.webhooks.bitbucket)
{
    console.log(tag, 'ENABLED - BitBucket Webhook')
    app.post('/webhooks/bitbucket',  middleware.validateBitbucketPullRequest, middleware.refreshConfig)
}

if(c.webhooks.github)
{
    console.log(tag, 'ENABLED - GitHub Webhook')
    app.post('/webhooks/github',  middleware.validateGithubPullRequest, middleware.refreshConfig)
}

app.get('/config/:instance',        middleware.getConfig)
app.get('/config/:instance/:env',   middleware.getConfig)

function start(cb)
{
    cb = cb || function(){}

    var didReturn = false;

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
    getPort: function()
    {
        return port;
    }
}
