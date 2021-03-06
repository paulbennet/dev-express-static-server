#!/usr/bin/env node

/**
 * @maintainers <Paul Joshua>
 */

/* eslint-env node */

/* eslint-disable no-console, no-empty */

let serverAPI = require("./server.js");

let path = require("path");
let fs = require("fs");

let PID_FILENAME = ".server_instance_{{PORT}}.pid";

let PROCESS_OPTS = {};

let expandHomeDir = function (dirPath) {

    if ( dirPath.startsWith("~") ) {
        dirPath = path.resolve ( path.join( process.env.HOME, dirPath.substr(1) ) );
        dirPath = dirPath.toString();
    }

    return dirPath;
}

let parseOpts = function () {

    process.argv.forEach(function (arg) {

        if (!arg.startsWith("--")) {
            return;
        }

        arg = arg.substr(2);
        let indexOfAssigment = arg.indexOf("=");

        if (indexOfAssigment !== -1) {
            arg = [ arg.substr(0, indexOfAssigment), arg.substr(indexOfAssigment + 1) ];
        } else {
            arg = [ arg ];
        }

        PROCESS_OPTS[arg[0]] = (arg.length === 1) ? true : arg[1];

    });

    PROCESS_OPTS.port = PROCESS_OPTS.port || 8080;

    PROCESS_OPTS.dir = expandHomeDir(PROCESS_OPTS.dir || ".");
    PROCESS_OPTS.keyPath = expandHomeDir(PROCESS_OPTS.keyPath || "./key.pem");
    PROCESS_OPTS.certPath = expandHomeDir(PROCESS_OPTS.certPath || "./cert.pem");

    PROCESS_OPTS.https = PROCESS_OPTS.https || false;
    PROCESS_OPTS.http2 = PROCESS_OPTS.http2 || false;
    PROCESS_OPTS.spdy = PROCESS_OPTS.spdy || false;

    PID_FILENAME = PID_FILENAME.replace("{{PORT}}", PROCESS_OPTS.port);

};

let killServer = function () {

    try {
        let pid = fs.readFileSync(path.resolve(path.join( "./", PID_FILENAME )));
        pid = pid.toString();

        serverAPI.kill(pid);

        fs.unlinkSync(path.resolve(path.join( "./", PID_FILENAME )));
    } catch (err) {
    }

};

let startServer = function () {

    killServer();

    let serverInstance = serverAPI.start( PROCESS_OPTS.port, PROCESS_OPTS.dir, {
        useSpdy: PROCESS_OPTS.spdy,
        useHttp2: PROCESS_OPTS.http2,
        useHttps: PROCESS_OPTS.https,
        keyPath: PROCESS_OPTS.keyPath,
        certPath: PROCESS_OPTS.certPath,
        onListen: function (args) {

            console.log("[SUCCESS] Static server started @ port = ", PROCESS_OPTS.port);
            console.log("[INFO] Process ID = ", String(process.pid));

            try {
                fs.writeFileSync(path.resolve(path.join( "./", PID_FILENAME)), String(args.pid));
            } catch (err) {
            }
        },
        onClose: function () {
            console.log("[INFO] Server is shutting down !");
            try {
                fs.unlinkSync(path.resolve(path.join( "./" , PID_FILENAME)));
            } catch (err) {
            }
        },
        onError: function (err) {
            if (err.code === 'EADDRINUSE') {
                console.log("[ERROR] Port already in use !");
            } else {
                console.log("[ERROR] Server cannot start !");
            }

            process.exit(-1);
        }
    } );

    let closeServer = function () {
        try {
            serverInstance.close();
        } catch (err) {
            console.log("[ERROR] Server cannot close !");
        }

        process.exit(0);
    };

    process.on("SIGINT", closeServer);
    process.on("SIGTERM", closeServer);

};

parseOpts();

if (PROCESS_OPTS.stop) {
    killServer();
    process.exit(0);
} else {
    startServer();
}