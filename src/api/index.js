const express = require("express");
const router = express.Router();

const {
    getMissions,
    addCrewmate,
    updateCrewmate,
    deleteCrewmate,
} = require("../db/queries");

express.response.sendWrapped = function (msg, res) {
    return this.json({
        message: msg,
        body: res,
    });
};

router.get("/missions", async (req, res) => {
    res.sendWrapped("List missions", await getMissions());
});

router.get("/missions/:missionId", async (req, res) => {
    // TODO: return 404 if not found by id?
    res.sendWrapped(
        `Mission with id=${req.params.missionId}`,
        (await getMissions()).filter((m) => m.id === +req.params.missionId)[0]
    );
});

router.get("/missions/:missionId/crew", async (req, res) => {
    res.sendWrapped(
        `Crew of mission with id=${req.params.missionId}`,
        (await getMissions())
            .filter((m) => m.id === +req.params.missionId)
            .map((m) => m.crew)
    );
});

router.post("/missions/:missionId/crew", async (req, res, next) => {
    try {
        const { astronaut_name, astronaut_dob } = req.body;
        const resp = await addCrewmate(req.params.missionId, {
            name: astronaut_name,
            date_of_birth: astronaut_dob,
        });

        res.status(201).sendWrapped(
            `Crewmate added with id=${resp[0].id}`,
            resp[0]
        );
    } catch (err) {
        // TODO: this will throw if missionId is not found.. mybe tell client that?
        // TODO: implement proper logging
        console.error({ err });
        if (err.severity && err.severity === "ERROR") res.status(400);
        next(
            new Error(`Error adding crewmate with id=${req.params.missionId}`)
        );
    }
});

router.delete(
    "/missions/:missionId/crew/:crewmateId",
    async (req, res, next) => {
        try {
            // TODO: notify user if there wasnt crewmate with that id?
            await deleteCrewmate(req.params.missionId, req.params.crewmateId);

            res.sendWrapped(
                `Crewmate with id=${req.params.crewmateId} removed from mission with id=${req.params.missionId}`
            );
        } catch (err) {
            console.error({ err });
            if (err.severity && err.severity === "ERROR") res.status(400);
            next(
                new Error(
                    `Error deleting crewmate with id=${req.params.crewmateId}`
                )
            );
        }
    }
);

router.get("/crewmates", async (req, res) => {
    const crew = (await getMissions()).map((m) => m.crew).flat();
    const distinct = crew.filter(
        (v, i, self) =>
            i === self.findIndex((t) => t.astronaut_name === v.astronaut_name)
    );

    res.sendWrapped("List crewmates", distinct);
});

router.put("/crewmates/:id", async (req, res, next) => {
    try {
        const resp = await updateCrewmate(req.params.id, {
            name: req.body.astronaut_name,
            date_of_birth: req.body.astronaut_dob,
        });

        if (resp.length) {
            res.sendWrapped(
                `Crewmate updated with id=${req.params.id}`,
                resp[0]
            );
        } else {
            res.status(404).sendWrapped(
                `Crewmate with id=${req.params.id} not found`
            );
        }
    } catch (err) {
        console.error({ err });
        if (err.severity && err.severity === "ERROR") res.status(400);
        next(new Error(`Error updating crewmate with id=${req.params.id}`));
    }
});

router.get("/wiki", async (req, res) => {
    res.sendWrapped(
        "List Wikipedia pages",
        (await getMissions()).map((m) => m.wiki_page)
    );
});

router.all(["/missions/**", "/crewmates/**", "/wiki/**"], (req, res, next) => {
    res.status(405).sendWrapped("Method not allowed")
})

module.exports = router;
