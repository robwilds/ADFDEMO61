require('dotenv').config();

const { getDeployedAppsProxy, getShareProxy, getApsProxy, getIdentityAdapterServiceProxy } = require('./proxy-helpers');

var legacyHost = "http://rwilds741.alfdemo.com/";
//const cloudHost = process.env.CLOUD_PROXY_HOST_ADF || process.env.PROXY_HOST_ADF;
//const cloudApps = process.env.APP_CONFIG_APPS_DEPLOYED;
var apsHost = "http://rwilds741.alfdemo.com/";

//var legacyHost = "http://localhost/";
//var apsHost = "http://localhost/";

module.exports = {
    ...getShareProxy(legacyHost),
    ...getApsProxy(apsHost),
   // ...getDeployedAppsProxy(cloudHost, cloudApps),
   // ...getIdentityAdapterServiceProxy(cloudHost)
};
