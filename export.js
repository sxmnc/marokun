var fmt = require('util').format;
var insert = "INSERT INTO `chain` (link1,link2,n) VALUES ('%s','%s',%s);";
function row(a, b, c) {
    a = a.replace(/\\/g, "\\\\").replace(/\'/g, "\\'");
    b = b.replace(/\\/g, "\\\\").replace(/\'/g, "\\'");
    var out = fmt(insert, a, b, c);
    console.log(out);
}

var sql = require('sqlite3');
var db = new sql.Database('sqlite/MarkovDB.sqlite');
db.all('SELECT * FROM chain', function (err, rows) {
    rows.forEach(function (r) {
        row(r.link1, r.link2, r.n);
    });
});
