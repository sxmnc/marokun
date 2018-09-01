const { Pool } = require("pg");

module.exports = function (core) {
    if (core.config.pgsql) {
        core.postgres_db = new Pool(core.config.pgsql);
    }
};