var readline = require('readline');
var mysql = require("mysql");

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
});

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'MarkovDB',
});

function dbInsert(word1, word2) {
    var findMatch = "SELECT * FROM chain " +
                    "WHERE (link1 = ? AND " +
                           "link2 = ?) " +
                    "LIMIT 1";
    db.query(findMatch, [word1, word2], function (err, rows) {
        if (rows.length == 1) {
            var match = rows[0];
            var increment = "UPDATE chain " +
                            "SET n = ? " +
                            "WHERE id = ?";
            db.query(increment, [match.n + 1, match.id]);
        } else {
            var insert = "INSERT INTO chain (link1, link2, n) " +
                         "VALUES (?, ?, ?)";
            db.query(insert, [word1, word2, 1]);
        }
    });
}

function read(text) {
   var words = text.split(/[ ,]+/);
    if (words.length > 1) {
        for (var i = 0; i < words.length - 1; i++) {
            dbInsert(words[i], words[i + 1]);
        }
        dbInsert(words[words.length - 1], ' ');
    }
}

db.connect();
rl.on('line', function (line) {
    read(line);
});
