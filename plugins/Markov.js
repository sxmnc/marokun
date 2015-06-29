var _ = require('lodash');
var mysql = require('mysql');

module.exports = function (core) {
    var plugin = {};
    var db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'MarkovDB',
    });
    var trigger = core.nickname;

    function getSeed(words) {
        var seed = 0;
        var wordSeed;
        if (words.length > 2) {
            seed = _.random(0, words.length - 2); // so we never get the last word.
            wordSeed = [words[seed], words[seed + 1]];
        } else {
            randomPhrase();
        }

        return wordSeed;
    }

    function randomPhrase() {
        db.query('SELECT * FROM chain', function (err, rows) {
            var index = _.random(0, rows.length - 1);
            var word = rows[index];
            if (word.link2 === ' ') {
                randomPhrase();
            } else {
                var newSeed = [word.link1, word.link2];
                buildPhrase(newSeed, '');
            }
        });
    }

    function buildPhrase(seed, phrase) {
        phrase += seed[0] + " ";
        db.query('SELECT * from chain WHERE link1 = ?', seed[1], function (err, rows) {
            var index = _.random(0, rows.length - 1);
            var word = rows[index];
            if (word.link2 === ' ') {
                phrase += seed[1] + " ";
                core.irc.sayPub(phrase);
                return;
            } else {
                var newSeed = [word.link1, word.link2];
                buildPhrase(newSeed, phrase);
            }
        });
    }

    function pubListener(nick, text) {
        if (core.util.containsIgnoreCase(text, trigger)) {
            var words = text.split(/[ ,]+/);
            buildPhrase(getSeed(words), '');
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
