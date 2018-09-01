var _ = require('lodash');

module.exports = function (core) {
    var plugin = {};
    // See maro-kun.sql for the definition of record_and_return()
    const omnipotent_query = "SELECT string_agg(words, ' ') as reply FROM record_and_return($1::text, $2::text) t(words);";

    function letTheDbDoEverything(message, cue) {
        core.postgres_db.query(omnipotent_query, [message, cue]).then((result) => {
            const markovReply = result.rows[0].reply; // Null if there's nothing to say

            console.log(markovReply);
            if (markovReply) {
                core.irc.sayPub(markovReply);
            }
        }).catch(err => console.error('Error executing query', err.stack));
    }

    function pubListener(nick, text) {
        if (nick !== core.nickname) letTheDbDoEverything(text, core.nickname);
    }

    plugin.load = function () {
        core.irc.on('pub', pubListener);
    };

    plugin.unload = function () {
        core.irc.removeListener('pub', pubListener);
    };

    return plugin;
};
