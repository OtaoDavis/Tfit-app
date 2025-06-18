
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-pedometer.Pedometer",
          "file": "plugins/cordova-plugin-pedometer/www/pedometer.js",
          "pluginId": "cordova-plugin-pedometer",
        "clobbers": [
          "pedometer"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-pedometer": "0.4.1"
    };
    // BOTTOM OF METADATA
    });
    