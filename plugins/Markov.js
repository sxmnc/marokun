var _ = require('lodash');
var sql = require('sqlite3');

module.exports = function (core) {
    var plugin = {};
    var trigger = core.nickname;
   
    function pubListener(nick, text) {
        console.log(trigger);
        if(core.util.containsIgnoreCase(text, trigger)) {
            // Generate stuff
        }
    }

    plugin.load = function () {
        core.irc.on('pub', pubListener);
    };

    plugin.unload = function () {
        core.irc.removeListener('pub', pubListener);
    };

    return plugin;
};
