module.exports = function (core) {
    var plugin = {};

    function dbInsert(word1, word2) {
        var findMatch = "SELECT * FROM chain " +
                        "WHERE (link1 = ? AND " +
                               "link2 = ?) " +
                        "LIMIT 1";
        core.db.queryOrPass(findMatch, [word1, word2], function (rows) {
            if (rows.length == 1) {
                var match = rows[0];
                var increment = "UPDATE chain " +
                                "SET n = ? " +
                                "WHERE id = ?";
                core.db.queryOrPass(increment, [match.n + 1, match.id]);
            } else {
                var insert = "INSERT INTO chain (link1, link2, n) " +
                             "VALUES (?, ?, ?)";
                core.db.queryOrPass(insert, [word1, word2, 1]);
            }
        });
    }

    function pubListener(nick, text) {
       var words = text.split(/[ ,]+/);
        if (words.length > 1) {
            for (var i = 0; i < words.length - 1; i++) {
                dbInsert(words[i], words[i + 1]);
            }
            dbInsert(words[words.length - 1], ' ');
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
