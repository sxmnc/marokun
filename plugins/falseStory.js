var _ = require('lodash');

module.exports = function (core) {
    var plugin = {};

    var callers = {

    };

    var triggers = {
        story: 'False story',
    };

    function pubListener(nick, text) {
        if (_.contains(text, triggers.story)) {
            core.irc.sayPub('>False story');
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
