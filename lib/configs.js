const clone = require('git-clone'),
    config = require('config'),
    c = config.get('configs'),
    del = require('del'),
    events = new (require('events').EventEmitter)(),
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
        process.env.NODE_ENV = env;

        process.env.NODE_APP_INSTANCE = instance;
        process.env.NODE_CONFIG_DIR = saveDir + '/' + configsDir;

        if(c.useInstanceDirs)
        {
            process.env.NODE_CONFIG_DIR += '/' + instance;
        }

        console.log(tag, 'Getting ' + instance + '.' + env + ' from ' + process.env.NODE_CONFIG_DIR)

        config.util.extendDeep(loadedConfig, config.util.loadFileConfigs());

        return cb(null, loadedConfig)
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
