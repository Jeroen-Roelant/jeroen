var connect = require('connect');
var serveStatic = require('serve-static');
var qs = require('qs');


require('dotenv').config();

let startDateTime = new Date();
let cvRefs = 0;
let dashRefs = 0;
let iplogs = [];

const MAX_IPLOGS = 1000;

function addToIplogs(log) {
    if (iplogs.length >= MAX_IPLOGS) {
        iplogs.shift(); // Remove the oldest item
    }
    iplogs.push(log);
}


connect()
    .use((req, res, next) => {
        addToIplogs(`${new Date().toLocaleString('en-GB')} UTC ${req.connection.remoteAddress} ${req.method} ${req.url}`);
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
                    <p>Running since ${startDateTime.toLocaleString('en-GB')} UTC </p>
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