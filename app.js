var connect = require('connect');
var serveStatic = require('serve-static');
require('dotenv').config();

connect()
    .use(serveStatic(__dirname + '/portfolio'))
    .use('/cv', (req, res) => {
        res.writeHead(302, {
            'Location': process.env.CV_URL
        });
        res.end();
    })
    .listen(process.env.PORT || 3000, () => console.log('Server running on ' + (process.env.PORT || 3000)));