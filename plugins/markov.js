var _ = require('lodash');

module.exports = function (core) {
    var plugin = {};

    function buildPhrase(seed, phrase) {
        if (seed.length == 2) {
            phrase.push(seed[0]);
        } else {
            seed[1] = seed[0];
        }

        var selectNext = "SELECT * FROM chain " +
                         "WHERE link1 = ? " +
                         "ORDER BY RAND() " +
                         "LIMIT 1";
        core.db.queryOrPass(selectNext, seed[1], function (rows) {
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
                phrase.push(seed[1]);
                if (phrase.length > 2) {
                    core.irc.sayPub(phrase.join(" "));
                }
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
            buildPhrase(words, []);
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
