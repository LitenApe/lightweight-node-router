const http = require('http'),
    router = require('./router');

router.import('./api');

// HTTP entry point
http.createServer((req, res) => {
    router.route(req, res);
}).listen(process.env.PORT || 8081);