const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const yamljs = require("yamljs");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const middlewares = require("./middlewares");
const routerApi = require("./api");
const routerViews = require("./views");
const swaggerDocument = yamljs.load("./src/api/openapi.yaml");
const { auth } = require("express-openid-connect");

const app = express();

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));
app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.use(morgan("dev"));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 8080;
let config = {
    authRequired: false
};
config.baseURL = process.env.APP_URL || `http://localhost:${PORT}`;
app.use(auth(config));

app.use(function (req, res, next) {
    res.locals.user = req.oidc.user;
    next();
});
app.use("/", routerViews);
app.use("/api", routerApi);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

app.listen(PORT, () => console.log(`Listenining on ${config.baseURL}`));
