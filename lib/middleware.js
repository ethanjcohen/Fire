const c = require('config').get('fireConfig.server'),
    configs = require('./configs'),
    BitbucketRequest = require('./bitbucket-request'),
    GithubRequest = require('./github-request');

module.exports = {
    refreshConfig: function (req, res)
    {
        process.nextTick(function()
        {
            configs.refresh()
        })

        res.json({
            status: 'Refreshing configs'
        })
    },
    getConfig: function (req, res)
    {
        configs.get(req.params.instance, req.params.env || 'development', function(err, configObj)
        {
            res.json(configObj)
        })
    },
    validateBitbucketPullRequest: function(req, res, next)
    {
        var bitbucketReq = new BitbucketRequest(req);

        if(!bitbucketReq.isMergeIntoBranch(c.webhooks.bitbucket.mergeInto))
        {
            return res.json({
                error: 'Expected pull request merge into branch ' + c.webhooks.bitbucket.mergeInto,
                status: 'Not refreshing'
            })
        }

        return next();
    },
    validateGithubPullRequest: function(req, res, next)
    {
        var githubReq = new GithubRequest(req);

        if(!githubReq.isMergeIntoBranch(c.webhooks.github.mergeInto))
        {
            return res.json({
                error: 'Expected pull request merge into branch ' + c.webhooks.github.mergeInto,
                status: 'Not refreshing'
            })
        }

        return next();
    }
}
