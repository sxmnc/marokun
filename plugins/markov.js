var _ = require('lodash');
var mysql = require('mysql');

module.exports = function (core) {
    var plugin = {};

    var db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'MarkovDB',
    });

    function buildPhrase(seed, phrase) {
        phrase.push(seed[0]);

        var selectNext = "SELECT * FROM chain " +
                         "WHERE link1 = ? " +
                         "ORDER BY RAND() " +
                         "LIMIT 1";
        db.query(selectNext, seed[1], function (err, rows) {
            if (rows.length === 1) {
                var word = rows[0];
                if (word.link2 === ' ') {
                    phrase.push(seed[1]);
                    core.irc.sayPub(phrase.join(" "));
                } else {
                    seed = [word.link1, word.link2];
                    buildPhrase(seed, phrase);
                }
            } else {
                console.log("buildPhrase fail");
                console.log(phrase);
            }
        });
    }

    function randomSeedPhrase() {
        var selectRandom = "SELECT * FROM chain " +
                           "ORDER BY RAND() " +
                           "LIMIT 1";
        db.query(selectRandom, function (err, rows) {
            if (rows.length === 1) {
                var word = rows[0];
                if (word.link2 === ' ') {
                    randomSeedPhrase();
                } else {
                    var seed = [word.link1, word.link2];
                    buildPhrase(seed, []);
                }
            } else {
                console.log("randomSeedPhrase fail");
            }
        });
    }

    function getSeed(words) {
        // So we never get the last word
        var i = _.random(0, words.length - 2);
        return [words[i], words[i + 1]];
    }

    function buildPhraseFor(words) {
        if (words.length > 2) {
            buildPhrase(getSeed(words), []);
        } else {
            randomSeedPhrase();
        }
    }

    function pubListener(nick, text) {
        if (core.util.containsIgnoreCase(text, core.nickname)) {
            var words = text.split(/[ ,]+/);
            buildPhraseFor(words);
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
