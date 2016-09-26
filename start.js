const fire = require('./index'),
    server = fire.server,
    configs = fire.configs,
    c = require('config'),
    source = configs.getSource(),
    tag = 'Fire: ';

configs.events.on('refreshed', function()
{
    console.log(tag, 'Configs refreshed: ' + configs.lastRefreshed)
})

server.start(function(err)
{
    if(!err)
    {
        console.log(tag, {
            Status: 'RUNNING',
            Date: new Date(),
            Port: server.getPort(),
            source: source
        })

        if(c.refreshOnStart !== false)
        {
            configs.refresh()
        }
    }
});
