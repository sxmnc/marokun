var _ = require('lodash');
var sql = require('sqlite3');

module.exports = function (core) {
    var plugin = {};
    var db = new sql.Database('MarkovDB.sqlite');
    
    function openDB() {
        db.serialize(function () {
            db.run('CREATE TABLE IF NOT EXISTS chain(link1 TEXT, link2 TEXT, n INT,'
                   +' CONSTRAINT pk_chain PRIMARY KEY (link1,link2))');
        });
    }
    
    function closeDB() {
        db.close();
    }
    
    function pubListener(nick, text) {
        words = core.util.argsToArray(text);
       
        if(words.length > 1){
            for (var i = 0; i < words.length -1; i++){
                var word1 = words[i];
                var word2 = words[i + 1];
                
                db.run('IF EXISTS (SELECT * WHERE pk_chain = (?,?))'
                       +' BEGIN UPDATE chain SET n = +1 WHERE pk_chain = (?,?)'
                       +' END ELSE BEGIN INSERT INTO chain VALUES (?,?,1)', 
                        [word1, word2], function (err) {
                            console.log(err);
                        });        
            }    
        }
        
        
    }

    plugin.load = function () {
        openDB();
        core.irc.on('pub', pubListener)
    };

    plugin.unload = function () {
        core.irc.removeListener('pub', pubListener);
        closeDB();
    };

    return plugin;
};
