var connect = require('connect');
var serveStatic = require('serve-static');
var qs = require('qs');

require('dotenv').config();

let startDateTime = new Date();
let cvRefs = 0;
let dashRefs = 0;
let pageVisits = 0;
let iplogs = [];

let pathsToIgnore = [];

const MAX_IPLOGS = process.env.MAXIPLOGS || 1000;

function addToIplogs(log) {
    if (iplogs.length >= MAX_IPLOGS) {
        iplogs.shift(); // Remove the oldest item
    }
    iplogs.push(log);
}


connect()
    .use((req, res, next) => {
        // Log every site visit
        if(!pathsToIgnore.includes(req.url)){
            if (req.url.includes(`/dash?pwd=${process.env.PASSWORD}`)) {
                addToIplogs(`<span style='color: rgb(255, 40, 40)'>${new Date().toLocaleString('en-GB')} UTC ${req.connection.remoteAddress} ${req.method} ${req.url}</span>`);
            }
            else if (req.url.includes('/dash')) {
                addToIplogs(`<span style='color: rgb(243, 181, 11)'>${new Date().toLocaleString('en-GB')} UTC ${req.connection.remoteAddress} ${req.method} ${req.url}</span>`);
            }
            else {
                addToIplogs(`${new Date().toLocaleString('en-GB')} UTC ${req.connection.remoteAddress} ${req.method} ${req.url}`);
            }
        }
        next();
    })
    .use(
        // Serve the portfolio
        serveStatic(__dirname + '/portfolio')
    )
    .use('/cv', (req, res) => {
        // Redirect to the CV
        res.writeHead(302, {
            'Location': process.env.CV_URL
        });
        cvRefs++;
        res.end();
    })
    .use('/dash', (req, res) => {
        // Dashboard
        var query = qs.parse(req._parsedUrl.query);
        const password = query.pwd;
        if (password === process.env.PASSWORD) {
            dashRefs++;
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Dashboard</title>
                </head>
                <body style='height: 100vh; display: flex; flex-direction: column; color: white; background-color: #34495E;'>
                    <div style='font-family: arial; display: flex; flex-direction: row; flex-wrap:wrap; justify-content: space-between;'>
                        <div>
                            <h1>Dashboard</h1>
                            <p>Running since ${startDateTime.toLocaleString('en-GB')} UTC </p>
                            <p>cv clicks: ${cvRefs} </p>
                            <p>dash visits: ${dashRefs} </p>
                            <p>page visits: ${pageVisits} </p>
                        </div>

                        <div>
                            <img src='https://jeroenroelant.tech/images/favicon.ico' alt='giphy'>
                        </div>
                    </div>

                    <div id="logContainer" style='height: 50vh; padding: 1em 1em 1em 1em; overflow: scroll; color: white; background-color: black; '>
                        <code>
                        ${iplogs.join('<br>')}
                        </code>
                    </div>
                </body>
                </html>
                <script>
                        var logContainer = document.getElementById("logContainer");
                        logContainer.scrollTop = logContainer.scrollHeight;
                </script>
            `);
        } else {
            res.statusCode = 401;
            res.end('Unauthorized');
        }
    })
    .listen(process.env.PORT || 3000, () => console.log('Server running on ' + (process.env.PORT || 3000)));