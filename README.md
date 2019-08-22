# dev-express-static-server
A simple static server for development mode using Express JS

---

Note:
- This utility's purpose is to be used in your local development environments. So some common production standards are ignored.
- By default site-index, cors, compression (gzip) is enabled

### 1. Installation

```shell
npm install --global dev-express-static-server
```


### 2. Usage (command-line)

#### 2.1. `startup` a server instance

```shell
dev-express-static-server <options>
```

#### Options ( \<options\> )

1. `--port=<port>` ( default = `8080` )
2. `--dir=<path-to-directory-to-server>` ( default = `{CWD}` )
3. `--https=<true/false>` [optional] ( default = `false` )
    - You can also just specify `--https` to set it as `true`
4. If `--https` enabled, `--keyPath=<path-to-key.pem-file>` [optional] ( default = "{CWD}/key.pem" )
5. If `--https` enabled, `--certPath=<path-to-cert.pem-file>` [optional] ( default = "{CWD}/cert.pem" )

E.g.

```shell
dev-express-static-server --port=9092 --https --keyPath="~/dev-certs/key.pem" --certPath="~/dev-certs/cert.pem"
```

Note:
- `{CWD}` is current directory where the command/util is running from
- All paths above support HOME dir shortcut char `~`
- Temporary PID files will be managed by the script on the current dir to manage servers, if started in background.

#### 2.2. `shutdown` a server instance

```shell
dev-express-static-server --stop --port=<port>
```

E.g.

```shell
dev-express-static-server --stop --port=9092
```

Note:
- `--port` option is mandatory as PID files will be created using port numbers as ID and using that we will shutdown node process.

### 3. Usage (api)

```javascript
let server = require("dev-express-static-server/server.js");
```

#### 3.1. `server.start(port, [directory, opts])` method

##### Arguments:

- `port` is required argument
- `directory` - Directory to serve ( default = `{CWD}` )
- `opts`
    - `opts.useHttps` - If `true`, `https` server instance will be created, otherwise `http` will be used
    - `opts.keyPath` - If `https` enabled, path to 
    `key.pem` file ( default = `{CWD}/key.pem` )
    - `opts.certPath` - If `https` enabled, path to `cert.pem` file ( default = `{CWD}/cert.pem` )
    - `opts.onListen` - `[callback]` function which will be invoked once the server starts up successfully and is listening for clients. An object argument with `{ pid: process.pid }` will be passed to the callback.

    ```javascript
        opts = {
            onListen: function (args) {
                console.log(args.pid);
            }
        }
    ```
    - `opts.onError` - `[callback]` function which will be invoked in case any error happens in server startup. The thrown `error` will be passed to the callback.

    ```javascript
        opts = {
            onError: function (err) {
                console.log(err.message);
            }
        }
    ```
    - `opts.onClose` - `[callback]` function which will be invoked once the server is stopped.

    ```javascript
        opts = {
            onClose: function () {
                console.log("Cleanup !");
            }
        }
    ```

##### Returns:

- Returns an object with `close` method, which if called shuts down the server

```javascript
let serverInstance = server.start(9092, path.resolve("../app/", {
    https: true,
    keyPath: path.join("../../dev-certs/key.pem"),
    certPath: path.join("../../dev-certs/cert.pem"),
    onListen: ...,
    onClose: ...,
    onError: ...
}) );

// After job done ..
serverInstance.close();
```

#### 3.2. `server.kill(processID)` method

You can also kill your server if running in a separate processs and you know its process ID.

Note:
- Be careful to not kill your current process

##### Arguments:

- `processID` is required argument

E.g.

```javascript
server.kill(9879869);
```