const clone = require('git-clone'),
    c = require('config').get('fireConfig.configs'),
    del = require('del'),
    events = new (require('events').EventEmitter)(),
    InstanceConfig = require('./instance-config'),
    tag = 'Configs: ';

var isRefreshing = false;

const saveDir = c.saveDir || './repocode',
    configsDir = c.configsDir || 'config';

events.on('refreshed', function()
{
    module.exports.lastRefreshed = new Date()
})

validateConfig();

function validateConfig()
{
    if(c.git)
    {
        if(!c.git.repo)
        {
            throw new Error('Error: No git.repo config specified')
        }
    }
    else
    {
        throw new Error('Error: No git config specified')
    }
}

function refresh()
{
    if(c.git)
    {
        console.log(tag, 'Refreshing configs via Git repo...')

        refreshViaGit();
    }
    else
    {
        console.error(tag, 'Error: No git config specified')
    }
}

function refreshViaGit()
{
    isRefreshing = true;

    var options = {
        checkout: c.git.checkout
    };

    //console.log('Cleaning repo...')

    del([ saveDir ])
        .then(paths =>
        {
            //console.log('Deleted files and folders:\n', paths.join('\n'));

            var repoUrl = c.git.repo;
            if(repoUrl.indexOf('https://') === 0)
            {
                repoUrl = repoUrl.substring(8);
            }

            if(c.git.username)
            {
                var user = c.git.username;

                if(c.git.password)
                {
                    user += ':' + c.git.password;
                }

                repoUrl = user + '@' + repoUrl;
            }

            repoUrl = 'https://' + repoUrl;

            //console.log('Cloning repo: ' + c.git.repo)

            clone(repoUrl, saveDir, options, function(err)
            {
                isRefreshing = false;
                setImmediate(function()
                {
                    events.emit('refreshed')
                })

                if(err)
                {
                    return console.log(tag, 'Error cloning from Git repo: ', err)
                }

                //console.log('Repo cloned!')
            })
    });
}

function getConfigs(instance, env, cb)
{
    var loadedConfig = {};

    if(isRefreshing)
    {
        events.once('refreshed', sendBackConfig)
    }
    else
    {
        sendBackConfig()
    }

    function sendBackConfig()
    {
        var config = new InstanceConfig(instance, env)
        config.loadFromFiles(saveDir + '/' + configsDir, c.useInstanceDirs)

        if(c.decryption && c.decryption.aesKey)
        {
            config.decryptAll(c.decryption.aesKey)
        }

        return cb(null, config)
    }
}

module.exports = {
    refresh: refresh,
    get: getConfigs,
    events: events,
    getSource: function()
    {
        if(c.git)
        {
            return {
                name: 'Git',
                repo: c.git.repo,
                checkout: c.git.checkout
            }
        }

        return null
    }
}
