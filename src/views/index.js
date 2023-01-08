const router = require("express").Router();

router.get("/", async (req, res, next) =>
    res.render("index", { user: res.locals.user })
);

router.get("/datatable", async (req, res, next) => res.render("datatable"));

router.get("/profile", (req, res, next) => {
    if (!res.locals.user) {
        res.status(401);
        throw Error("Only for logged in users!");
    }
    res.render("profile", { user: res.locals.user });
});

module.exports = router;
