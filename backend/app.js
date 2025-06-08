//app.js
const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./utils/errorHandler");
require("./services/cron_jobs/hackathonsUpdater"); // Starting Cron-Jobs...
const MainRouter = require("./routes/MainRouter");
const socketAuth = require("./socket/socketAuth");
const http = require("http");
const { Server } = require("socket.io");
const swaggerUi = require("swagger-ui-express")
const swaggerDocument = require("./swagger.json")

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

app.use(express.static("public"));

const corsOptions = {
  origin: ["http://localhost:3000", 'https://coflow.netlify.app'], // Allow frontend domain
  credentials: true, // Allow credentials (cookies)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  maxAge: 600,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const limiter = rateLimit({
  //Must to be used in production to prevent attacks...
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 15 requests per windowMs
  message: { success: false, msg: "Too many requests from this IP, please try again after 1 minute" },
  headers: true,
});
app.use(limiter);

app.use(helmet());

app.use(passport.initialize()); //Initialize OAuth2.0

// WebSocket connection...
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket"],
});
// WebSockets Auth Middleware
io.use(socketAuth);

// Share io with all routes
app.set("io", io);

// Init Socket.IO logic
require("./socket/index")(io);

// REST API...
app.get("/", async (req, res) => {
  return res.status(200).json({
    status: "success",
    details: `You are Viewing a Non-API Route (${req.url}), Use '/api/' for all other endpoints to access them`,
  });
});

// Serve Swagger UI Docs...
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Starter...
app.use("/api", MainRouter);

app.use((req, res) => {
  return res.status(404).json({
    status: "Not Found",
    details: `Requested path/method {${req.url} & ${req.method}} Not Found`,
  });
});

app.use(errorHandler);

module.exports = server;
