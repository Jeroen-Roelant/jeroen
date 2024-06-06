var connect = require('connect');
var serveStatic = require('serve-static');

connect()
    .use(serveStatic(__dirname + '/portfolio'))
    .use('/cv', (req, res) => {
        res.writeHead(302, {
            'Location': 'https://drive.google.com/file/d/13EGmqXNyvIw8KwkuFV4bqFy-DbzIOpiN/view?usp=sharing'
        });
        res.end();
    })
    .listen(process.env.PORT || 3000, () => console.log('Server running on ' + (process.env.PORT || 3000)));