var connect = require('connect');
var serveStatic = require('serve-static');

connect()
    .use(serveStatic(__dirname + '/portfolio'))
    .use('/cv', function(req, res, next) {
        res.writeHead(301, { 'Location': '/cv_JeroenRoelant.pdf' });
        res.end();
    })
    .listen(process.env.PORT || 3000, () => console.log('Server running on ' + (process.env.PORT || 3000)));