const Keys = {
    pullRequest: 'pull_request'
}

const Actions = {
    pullRequest: {
        closed: 'closed'
    }
}

function GithubRequest(req)
{
    this.req = req;
    this.key = req.get('x-github-event');

    if(req.body)
    {
        this.action = req.body.action;
        this.pullrequest = req.body.pull_request;
    }

    //console.log('x-hub-signature: ', req.get('x-hub-signature'))
    //console.log(req.body)

    if(this.key === Keys.pullRequest && this.action === Actions.pullRequest.closed && this.pullrequest)
    {
        console.log('GithubRequest: Pull Request Closed detected - ' +
            this.pullrequest.head.ref + ' => ' +
            this.pullrequest.base.ref + ' by ' +
            this.pullrequest.user.login)
    }
    else
    {
        console.error('GithubRequest: Error: unhandled event key:action detected - ', this.key + ':' + this.action)
    }
}

GithubRequest.prototype.isMergeIntoBranch = function(branchName)
{
    if(this.key !== Keys.pullRequest || this.action !== Actions.pullRequest.closed || !this.pullrequest)
    {
        return false;
    }

    return this.pullrequest.base.ref === branchName;
};

module.exports = GithubRequest;
