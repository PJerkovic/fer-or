const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const routerApi = require("./api");
const routerViews = require("./views");

const app = express();

app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "./views"));
app.set("json spaces", 2);
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.use(morgan("dev"));

app.use("/", routerViews);
app.use("/api", routerApi);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
