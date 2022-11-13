const router = require("express").Router();

router.get("/datatable", async (req, res, next) => res.render("datatable"));
router.get("/", async (req, res, next) => res.render("index"));

module.exports = router;
