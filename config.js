module.exports = {
    core: {
        server: 'irc.freenode.net',
        port: 6667,
        channel: '#SexManiac',

        nickname: 'Maro-kun',
        password: '********',
        realname: '<3',
        operator: false,

        debug: true,
    },
    mysql: {
        connectionLimit: 10,
        host: 'localhost',
        user: 'root',
        database: 'MarkovDB',
    },
};
