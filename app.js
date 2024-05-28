var connect = require('connect');
var serveStatic = require('serve-static');

connect()
    .use(serveStatic(__dirname + '/portfolio'))
    .listen(process.env.PORT || 3000, () => console.log('Server running'));