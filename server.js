/**
 * @maintainers <Paul Joshua>
 */

/* eslint-env node */

/* eslint-disable no-console */

let execSync = require("child_process").execSync;
let https = require("https");
let http = require("http");
let path = require("path");
let fs = require("fs");
let serverDestroy = require("server-destroy");

let express = require("express");
let compression = require("compression");
let cors = require("cors");
let serveIndex = require("serve-index");

let killServer = function (processID) {

    if (process.platform === "win32") {
        execSync("taskkill /F /PID " + processID, {
            stdio: "ignore"
        });
    } else {
        execSync("kill " + processID, {
            stdio: "ignore"
        });
    }

};

let startServer = function ( port, directory, args ) {

    let app = new express();

    let useHttps = args.useHttps || false;
    let keyPath = args.keyPath || "./key.pem";
    let certPath = args.certPath || "./cert.pem";

    app.use(compression());
    app.use(cors());

    let pathToServe = path.resolve( directory || "." );

    app.use("/", express.static( pathToServe, { acceptRanges: true, cacheControl: false } ));
    app.use("/", serveIndex( pathToServe, { icons: true }));

    let server;

    if (useHttps) {
        server = https.createServer({
            key: fs.readFileSync( path.resolve( keyPath ) ),
            cert: fs.readFileSync( path.resolve( certPath ) )
        }, app);
    } else {
        server = http.createServer({}, app);
    }

    server.listen(port);
    serverDestroy(server);

    server.once("listening", function () {

        if (args.onListen) {
            args.onListen({ pid: process.pid });
        }
    });

    server.once("error", function (err) {

        if (args.onError) {
            args.onError(err);
        }

        process.exit(-1);
    });

    let closeServer = function () {

        server.destroy();

        if (args.onClose) {
            args.onClose({ pid: process.pid });
        }
    };

    return { close: closeServer } ;

};

exports.start = startServer;
exports.kill = killServer;