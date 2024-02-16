const bodyParser = require("body-parser");
const express = require("express");
const helmet = require("helmet");
const http = require("http");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
require("dotenv").config();
const socketIo = require("socket.io");

const config = require("../config/");
const dbService = require("./services/db.service");

const mongodbService = require("./services/mongodb.services");
const { verifyToken, bundleToken } = require("../middleware/VerifyToken");
const SocketConfig = require("../SocketConfig");

const environment = process.env.NODE_ENV;
const app = express();

Sentry.init({
  dsn: "https://633aa23eb73b71d75e0c797d2dd31609@o4506744548491264.ingest.sentry.io/4506744555503616",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(fileUpload());
app.set("trust proxy", true);
app.use(
  morgan(
    ":remote-addr - :method :url :status :res[content-length] :response-time ms"
  )
);

const server = http.Server(app);
const io = socketIo(server);
SocketConfig.getLiveData(io);

const MDB = mongodbService(environment, config.migrate);
const webSocket = require("./services/web3.socket.service");
const corsOpts = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const initializeWatchers = require("../config/watcherManager");

console.log("api");
app.use(cors(corsOpts));
app.use(
  helmet({
    dnsPrefetchControl: false,
    frameguard: false,
    ieNoOpen: false,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public/api", config.mappedIeoRoutes);
app.use("/public/api", config.mappedMasterRoutes);
app.use("/public/api", config.mappedMerchantRoutes);
app.use("/public/api", config.mappedPassesRoutes);
app.use("/public/api", config.mappedPassportsRoutes);
app.use("/public/api", config.mappedVisasRoutes);
app.use("/public/api", config.mappedPayRoutes);
app.use("/public/api", config.mappedTransactionRoutes);
app.use("/public/api", config.mappedSettlementRoutes);
app.use("/public/api", config.mappedRawRoutes);
app.use("/public/api", config.mappedQRRoutes);
app.use("/public/api", config.mappedBusinessRoutes);
app.use("/public/api", config.mappedRestaurantRoutes);
app.use("/public/api", config.mappedIntegrationPartnerRoutes);
app.use("/public/api", config.mappedEmployeeRoutes);
app.use("/public/api", config.mappedAdminRoutes);
app.use("/public/api", config.mappedAnalyticsRoutes);
app.use("/public/api", config.mappedEventRoutes);
app.use("/public/api", config.mappedPromocodeRoutes);
app.use("/public/api", config.mappedBookingRoutes);
app.use("/public/api", config.mappedStripeRoutes);
app.use("/public/api", config.mappedFiatTransactionRoutes);
// Test
app.use("/public/api", config.mappedTestRoute)

app.use(Sentry.Handlers.errorHandler());


// comment for testing
server.listen(config.port, () => {
  if (
    environment !== "production" &&
    environment !== "development" &&
    environment !== "testing"
  ) {
    console.error(
      `NODE_ENV is set to ${environment}, but only production and development are valid.`
    );
    process.exit(1);
  }
  console.log(`Server is connected to port: ${config.port} successfully...`);
});

// uncomment for testing
// module.exports = app;