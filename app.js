var connect = require('connect');
var serveStatic = require('serve-static');
var qs = require('qs');


require('dotenv').config();

let startDateTime = new Date();
let cvRefs = 0;
let dashRefs = 0;
let iplogs = [];

connect()
    .use((req, res, next) => {
        iplogs.push(`Incoming request from IP address: ${req.connection.remoteAddress} for ${req.url} at ${new Date().toLocaleString('en-GB')}`);
        next();
    })
    .use(serveStatic(__dirname + '/portfolio'))
    .use('/cv', (req, res) => {
        res.writeHead(302, {
            'Location': process.env.CV_URL
        });
        cvRefs++;
        res.end();
    })
    .use('/dash', (req, res) => {
        var query = qs.parse(req._parsedUrl.query);
        const password = query.pwd;
        if (password === process.env.PASSWORD) {
            dashRefs++;
            res.end(`
                <div>
                    <h1>Dashboard</h1>
                    <p>Running since ${startDateTime.toLocaleString('en-GB')} </p>
                    <p>cv clicks: ${cvRefs} </p>
                    <p>dash visits: ${dashRefs} </p>
                    <p>IP logs: </p>
                    <div style=' height: 500px; width:1000px; overflow: scroll; color: white; background-color: black;'>
                        ${iplogs.join('<br>')}
                    </div>
                </div>
            `);
        } else {
            res.statusCode = 401;
            res.end('Unauthorized');
        }
        
    })
    .listen(process.env.PORT || 3000, () => console.log('Server running on ' + (process.env.PORT || 3000)));