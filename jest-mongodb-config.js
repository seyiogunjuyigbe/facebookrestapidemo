module.exports = {
    mongodbMemoryServerOptions: {
        instance: {
            dbName: 'facebookapi'
        },
        binary: {
            version: '4.0.2', // Version of MongoDB
            skipMD5: true
        },
        autoStart: false
    }
};