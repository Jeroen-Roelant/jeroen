var connect = require("connect");
var serveStatic = require("serve-static");
var qs = require("qs");
var mysql = require("mysql");
var weather = require("openweather-apis")

require("dotenv").config();

weather.setLang('en')
weather.setAPPID(process.env.OPENWEATHER)
weather.setCity(process.env.LOCATION)
weather.setUnits('metric')

let startDateTime = new Date();

// #region REFS


let cvRefs = 0;
let cvRefsMail = 0;
let cvRefsSite = 0;

let totalCvRefs = 0;
let totalCvRefsMail = 0;
let totalCvRefsSite = 0;

let cvRefsCurrentRow = 0;

let dashRefs = 0;

let iplogs = [];

let pathsToIgnore = [];

const MAX_IPLOGS = process.env.MAXIPLOGS || 1000;
const ENABLE_DB = process.env.ENABLE_DB || false;

function addToIplogs(log) {
  if (iplogs.length >= MAX_IPLOGS) {
    iplogs.shift(); // Remove the oldest item
  }
  iplogs.push(log);
}

async function getRefs() {
  await connection.query(
    "SELECT siteRef FROM cvrefs WHERE id = (SELECT MAX(id) FROM cvrefs);",
    (err, result) => {
      if (err) console.error(err);
      cvRefsSite = result[0].siteRef;
    },
  );

  await connection.query(
    "SELECT mailRef FROM cvrefs WHERE id = (SELECT MAX(id) FROM cvrefs);",
    (err, result) => {
      if (err) console.error(err);
      cvRefsMail = result[0].mailRef;
    },
  );

  await connection.query(
    "SELECT otherRef FROM cvrefs WHERE id = (SELECT MAX(id) FROM cvrefs);",
    (err, result) => {
      if (err) console.error(err);
      cvRefs = result[0].otherRef;
    },
  );

  await connection.query(
    "SELECT SUM(siteRef) AS totalSiteRef FROM cvrefs;",
    (err, result) => {
      if (err) console.error(err);
      totalCvRefsSite = result[0].totalSiteRef;
    },
  );

  await connection.query(
    "SELECT SUM(mailRef) AS totalMailRef FROM cvrefs;",
    (err, result) => {
      if (err) console.error(err);
      totalCvRefsMail = result[0].totalMailRef;
    },
  );

  await connection.query(
    "SELECT SUM(otherRef) AS totalOtherRef FROM cvrefs;",
    (err, result) => {
      if (err) console.error(err);
      totalCvRefs = result[0].totalOtherRef;
    },
  );

  return true;
}

// #endregion REFS

// Connect to MySQL instance
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

if (ENABLE_DB) {
  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
    } else {
      console.log("Connected to MySQL");
      connection.query(
        "CREATE TABLE IF NOT EXISTS cvrefs (id INT AUTO_INCREMENT PRIMARY KEY, siteRef INT, mailRef INT, otherRef INT);",
        (err, result) => {
          if (err) console.error(err);
        },
      );
      connection.query(
        "INSERT INTO cvrefs (siteRef, mailRef, otherRef) VALUES (0, 0, 0);",
        (err, result) => {
          if (err) console.error(err);
        },
      );
      connection.query(
        "SELECT COUNT(*) AS refsCount FROM cvrefs;",
        (err, result) => {
          if (err) console.error(err);
          cvRefsCurrentRow = result[0].refsCount;
        },
      );
    }
  });
}

connect()
  .use((req, res, next) => {
    // Log every site visit
    if (!pathsToIgnore.includes(req.url)) {
      if (
        (process.env.PASSWORD || false) &&
        req.url.includes(`/dash?pwd=${process.env.PASSWORD}`)
      ) {
        addToIplogs(
          `<span style='color: rgb(255, 40, 40)'>${new Date().toLocaleString("en-GB")} UTC ${req.connection.remoteAddress}    ${req.method}   ${req.url}</span>`,
        );
      } else if (req.url.includes("/dash")) {
        addToIplogs(
          `<span style='color: rgb(243, 181, 11)'>${new Date().toLocaleString("en-GB")} UTC ${req.connection.remoteAddress}   ${req.method}   ${req.url}</span>`,
        );
      } else if (req.url.includes("/project.html?id=")) {
        addToIplogs(
          `<span style='color: rgb(0, 255, 255)'>${new Date().toLocaleString("en-GB")} UTC ${req.connection.remoteAddress}   ${req.method}   ${req.url}</span>`,
        );
      } else if (req.url.includes("/images")) {
        addToIplogs(
          `<span style='color: rgb(100, 100, 100)'>${new Date().toLocaleString("en-GB")} UTC ${req.connection.remoteAddress}   ${req.method}   ${req.url}</span>`,
        );
      } else {
        addToIplogs(
          `${new Date().toLocaleString("en-GB")} UTC ${req.connection.remoteAddress} ${req.method} ${req.url}`,
        );
      }
    }
    next();
  })
  .use(
    // Serve the portfolio
    serveStatic(__dirname + "/portfolioNew"),
  )
  .use("/wordle", serveStatic(__dirname + "/wordleClone"))
  .use("/legacy", serveStatic(__dirname + "/portfolio"))
  .use("/cv", async (req, res) => {
    if (ENABLE_DB) {
      var query = qs.parse(req._parsedUrl.query);
      const method = query.method;
      // Redirect to the CV
      if (method === "mail") {
        await connection.query(
          `UPDATE cvrefs SET mailRef = mailRef + 1 WHERE id = ${cvRefsCurrentRow};`,
          (err, result) => {
            if (err) console.error(err);
          },
        );
      } else if (method === "site") {
        await connection.query(
          `UPDATE cvrefs SET siteRef = siteRef + 1 WHERE id = ${cvRefsCurrentRow};`,
          (err, result) => {
            if (err) console.error(err);
          },
        );
      } else {
        await connection.query(
          `UPDATE cvrefs SET otherRef = otherRef + 1 WHERE id = ${cvRefsCurrentRow};`,
          (err, result) => {
            if (err) console.error(err);
          },
        );
      }
    }

    const url = process.env.CV_URL || "#";

    res.writeHead(302, {
      Location: url,
    });

    res.end();
  })
  .use("/dash", async (req, res) => {
    // Dashboard
    var query = qs.parse(req._parsedUrl.query);
    const password = query.pwd;

    const _pwd = process.env.PASSWORD;

    if (!!_pwd && password === _pwd) {
      dashRefs++;

      getRefs();

      while (totalCvRefs === 0) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

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
                            <p>Running since ${startDateTime.toLocaleString("en-GB")} UTC </p>
                            <p>cv clicks site: ${cvRefsSite} (total: ${totalCvRefsSite}) </p>
                            <p>cv clicks mail: ${cvRefsMail} (total: ${totalCvRefsMail}) </p>
                            <p>cv clicks other: ${cvRefs} (total: ${totalCvRefs}) </p>
                            <p>dash visits: ${dashRefs} </p>
                        </div>

                        <div>
                            <img src='https://roelant.dev/images/favicon.ico' alt='giphy'>
                        </div>
                    </div>

                    <div id="logContainer" style='height: 50vh; padding: 1em 1em 1em 1em; overflow: scroll; color: white; background-color: black; '>
                        <code>
                        ${iplogs.join("<br>")}
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
      res.end("Unauthorized");
    }
  })
  .use("/epaper", async (req, res) => {
    // Dashboard
    try {
    var query = qs.parse(req._parsedUrl.query);
    const password = query.pwd;

    const _pwd = process.env.PASSWORD;

    if (!!_pwd && password === _pwd) {
      res.end(
        (() => JSON.stringify(weather.getTemperature(function(err, temp){
          return temp
        })))())
        JSON.stringify({
        time: Date.now(),
        content: `
          Jeroen's dashboard: \n
        ` 
      })
    } else {
      res.statusCode = 401;
      res.end("Unauthorized");
    }
    }
    catch (e)  {
      res.end(e)
    }

  })
  .listen(process.env.PORT || 3000, () =>
    console.log("Server running on " + (process.env.PORT || 3000)),
  );
