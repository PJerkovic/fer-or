const db = require("./index");

async function getMissions() {
    const { rows } = await db.query(`
        select 
            apollo_mission.id,
            mission_name,
            launch_date,
            launch_site,
            json_agg(
                json_build_object(
                    'id', astronaut.id,
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
        group by apollo_mission.id, mission_name, launch_date, launch_site, launch_vehicle, command_module, lunar_module, duration, remarks, wiki_page
        order by launch_date;
    `);
    return rows.map((m) => {
        m.launch_date = m.launch_date.toISOString().substring(0, 10);
        m.duration = m.duration ? m.duration.toISOString() : "";
        return m;
    });
}

async function addCrewmate(mission_id, { name, date_of_birth }) {
    const client = await db.connect();

    let resp = null;
    try {
        await client.query("BEGIN");
        resp = await client.query(
            `INSERT INTO astronaut (name, date_of_birth)
            VALUES ($1, $2)
            RETURNING *`,
            [name, date_of_birth]
        );

        await client.query(
            `INSERT INTO apollo_mission_astronaut (apollo_mission, astronaut)
                VALUES ($1, $2)`,
            [mission_id, resp.rows[0].id]
        );

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }

    return resp.rows;
}

async function updateCrewmate(id, { name, date_of_birth }) {
    return (await db.query(
        `UPDATE astronaut SET name = $1, date_of_birth = $2 WHERE id = $3 RETURNING *`,
        [name, date_of_birth, id]
    )).rows;
}

async function deleteCrewmate(missionId, id) {
    await db.query(
        `DELETE FROM apollo_mission_astronaut WHERE apollo_mission = $1 AND astronaut = $2`,
        [missionId, id]
    );
}
module.exports = { getMissions, addCrewmate, updateCrewmate, deleteCrewmate };
