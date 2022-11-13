const router = require("express").Router();

const missions = require("./missions");

router.use("/missions", missions.router);

module.exports = router;
