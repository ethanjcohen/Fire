var config = require('config'),
    CryptoJS = require('crypto-js'),
    tag = 'InstanceConfig: ';

function InstanceConfig(instance, environment)
{
    this.instance = instance
    this.env = environment
}

InstanceConfig.prototype.loadFromFiles = function (directory, useInstanceDirs)
{
    process.env.NODE_ENV = this.environment;
    process.env.NODE_APP_INSTANCE = this.instance;
    process.env.NODE_CONFIG_DIR = directory;

    if(useInstanceDirs)
    {
        process.env.NODE_CONFIG_DIR += '/' + this.instance;
    }

    console.log(tag, 'Getting ' + this.instance + '.' + this.env + ' from ' + process.env.NODE_CONFIG_DIR)

    config.util.extendDeep(this, config.util.loadFileConfigs());

    return this
};

InstanceConfig.prototype.decryptAll = function(aesKey)
{
    if(!aesKey) { return }

    decryptKeys(this)
    return this

    function decryptKeys(obj)
    {
        Object.keys(obj).forEach(function(key)
        {
            if(typeof obj[key] === 'string' && obj[key].substring(0, 5) === 'ENCR ')
            {
                var value = obj[key].substring(5)
                obj[key] = decryptString(value)
            }
            else if(typeof obj[key] === 'object')
            {
                decryptKeys(obj[key])
            }
        })
    }

    function decryptString(encryptedValue)
    {
        var bytes  = CryptoJS.AES.decrypt(encryptedValue, aesKey);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        return plaintext
    }
}

module.exports = InstanceConfig
