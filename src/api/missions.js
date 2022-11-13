const router = require("express").Router();

const db = require("../db");

async function getMissions() {
    const { rows } = await db.query(`
        select 
            mission_name,
            launch_date,
            launch_site,
            json_agg(
                json_build_object(
                    'astronaut_name', astronaut.name,
                    'astronaut_dob', astronaut.date_of_birth
                )
            ) as crew,
            launch_vehicle,
            command_module,
            lunar_module,
            duration,
            remarks,
            wiki_page
        from apollo_mission
        join apollo_mission_astronaut on apollo_mission.id = apollo_mission_astronaut.apollo_mission 
        join astronaut on astronaut.id = apollo_mission_astronaut.astronaut
        group by mission_name, launch_date, launch_site, launch_vehicle, command_module, lunar_module, duration, remarks, wiki_page
        order by launch_date;
    `);
    return rows.map((m) => {
        m.launch_date = m.launch_date.toISOString().substring(0, 10);
        m.duration = m.duration ? m.duration.toISOString() : "";
        return m;
    });
}

router.get("/", async (req, res) => {
    res.send(await getMissions());
});

module.exports = {router, getMissions};
