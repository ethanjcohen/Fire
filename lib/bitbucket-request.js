const Keys = {
    merge: 'pullrequest:fulfilled'
}

function BitbucketRequest(req)
{
    this.req = req;
    this.key = req.get('x-event-key');

    if(req.body)
    {
        this.actor = req.body.actor;
        this.pullrequest = req.body.pullrequest;
        this.repository = req.body.repository;
    }

    //console.log(req.body)

    if(this.key === Keys.merge && this.pullrequest)
    {
        console.log('BitbucketRequest: Pull Request Merged detected - ' +
            this.pullrequest.source.branch.name + ' => ' +
            this.pullrequest.destination.branch.name + ' by ' +
            this.pullrequest.author.display_name)
    }
    else
    {
        console.error('BitbucketRequest: Error: unhandled event key detected - ', this.key)
    }
}

BitbucketRequest.prototype.isMergeIntoBranch = function(branchName)
{
    if(this.key !== Keys.merge || !this.pullrequest)
    {
        return false;
    }

    return this.pullrequest.destination.branch.name === branchName;
};

module.exports = BitbucketRequest;
