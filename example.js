var fire = require('./index'),
    server = fire.server,
    configs = fire.configs;

configs.events.on('refreshed', function() {
    //notify your system that new configs are available
})

server.use(
    function(req, res, next)
    {
        console.log('Input: ', req.body)
        return next()
    },
    function(req, res, next)
    {
        console.log('Second middleware')
        return next()
    }
)

server.start(function(err) {
    if(!err) {
        //The REST API server is now running

        //Refresh the configs from our repo
        configs.refresh()
    }
})
