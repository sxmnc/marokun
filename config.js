module.exports = {
    core: {
        server: 'irc.freenode.net',
        port: 6667,
        channel: '#SexManiac',

        nickname: 'Maro-kun',
        realname: '<3',
        password: '********',

        debug: true,
    },
    mysql: {
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        database: 'MarkovDB',
    },
    pgsql: {
        host: 'localhost',
        database: 'markovdb',
        port: 5433,
		user: 'maro-kun',
        max: 10,
	},
};
