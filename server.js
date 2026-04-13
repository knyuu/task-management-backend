
const express = require("express");
const helmet = require("helmet");
const path = require("path");
const log = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const httpModule = require("http");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const q = require("q");

require("module-alias/register");
require("dotenv").config();

const setting = require('./utils/setting');
const { LogProvider } = require('./shared/log_nohierarchy/log.provider');

const ManagementSocket = require('./app/management/socket.concern');
const ChannelSocket = require('./app/office/channel/socket');

const routerOffice = require('./app/office/routerProvider');
const routerManagement = require('./app/management/routerProvider');


const { FacebookProvider } = require('./shared/passport/facebook.provider');
const { SocketProvider } = require('./shared/socket/provider');
var initResource = require('./shared/init').init;
const { FileConst } = require('./shared/file/file.const');

const { QueueProvider } = require('./shared/queu/queue.provider');

const {
    CORS_ALLOWED_ORIGINS,
} = process.env;

const app = express();

class Server {
    constructor() {
        this.initViewEngine();
        this.initExpressMiddleware();
        this.initResource().then(() => { this.initCronjob(); });
        this.initRouter();

        const cors_allowed_origins = CORS_ALLOWED_ORIGINS || '[]';
        this.cors_allowed_origins = Array.isArray(JSON.parse(cors_allowed_origins)) ? JSON.parse(cors_allowed_origins) : [];

        this.initStatusRouter();
        this.start();
    }

    start() {
        const http = httpModule.Server(app);
        var server = http.listen(setting.port, setting.hostname, function () {
            LogProvider.info(
                "Server is listening port " + setting.port,
                "server.start",
                "system",
                "startserver"
            );
        });
        server.setTimeout(100000000);
        initResource.initIO(server);
        initResource.io.on("connection",  (socket) => {
            SocketProvider.joinRoom(socket, `${socket.id}`);
            ManagementSocket(socket);
            ChannelSocket(socket);
        });
        process.on('uncaughtException', err => {
            console.log('There was an uncaught error', err)
            process.exit(1) //mandatory (as per the Node.js docs)
        })
        process.on('SIGTERM', () => {
            console.log('🔄 Graceful shutdown...');
            QueueProvider.cleanup()
                .then(() => {
                    console.log('✅ Cleanup completed');
                    process.exit(0);
                })
                .catch((error) => {
                    console.log('❌ Cleanup failed:', error);
                    process.exit(1);
                });
        });
    }

    initViewEngine() {
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'pug');
    }

    initExpressMiddleware() {

        app.set('trust proxy', 1);
        app.use(log('dev'));
        app.use(bodyParser.json({ limit: '10mb' }));
        app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

        const corsOptions = {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    'http://localhost:3105',
                    'http://localhost:3005',
                    'https://view.officeapps.live.com',
                    'https://*.eranin.com',
                    'http://*.eranin.com',
                    ...this.cors_allowed_origins
                ];

                const eraninRegex = /^https?:\/\/[a-zA-Z0-9-]+\.eranin\.com$/;
                const ahsoRegex = /^https?:\/\/[a-zA-Z0-9-]+\.ahso\.vn$/;
                const localhostRegex = /^https?:\/\/localhost(:\d+)?$/;

                if (allowedOrigins.includes(origin) ||
                    eraninRegex.test(origin) ||
                    ahsoRegex.test(origin) ||
                    localhostRegex.test(origin) ||
                    !origin) {
                    callback(null, true);
                } else {
                    console.log('❌ CORS Deny:', origin);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true
        };

        app.use(cors(corsOptions));
        app.use(
            helmet.contentSecurityPolicy({
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'self'"],
                    frameAncestors: ["'self'", "http://localhost:3005", "https://view.officeapps.live.com", 'https://*.eranin.com', 'http://*.eranin.com']

                }
            })
        );


        app.use(session({
            secret: setting.secretSession,
            saveUninitialized: true,
            resave: true
        }));

        app.use(passport.initialize());
        app.use(flash());
        FacebookProvider.set(passport, function (accessToken, refreshToken, profile) {

        });


    }

    initRouter() {
        const FILES_DIR = FileConst.pathLocal;

        app.use('/files', express.static(FILES_DIR));
        app.get('/files/:filename', (req, res) => {
            const filePath = path.join(FILES_DIR, req.params.filename);
            res.sendFile(filePath);
        });
        app.use('/fileDownload', express.static(FILES_DIR));
        app.get('/fileDownload/:filename', (req, res) => {
            const filePath = path.join(FILES_DIR, req.params.filename);
            res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
            res.download(filePath);
        });
        for (var i in routerOffice) {
            app.use(routerOffice[i].path, routerOffice[i].router);
        }

        for (var i in routerManagement) {
            app.use(routerManagement[i].path, routerManagement[i].router);
        }

    }

    initResource() {
        // initResource.initIO();
        initResource.initFirebase();
        return q.all([
            initResource.initMongoDB(),
            initResource.initRedis(),
        ]);
    }

    initStatusRouter() {
        app.use(function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
    }

    initCronjob() {
        // TODO: Implement cronjob
    }

}

new Server();



















