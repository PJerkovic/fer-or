$(document).ready(function () {
    // Setup - add a text input to each footer cell
    $("#example thead tr")
        .clone(true)
        .addClass("filters")
        .appendTo("#example thead");

    const table = $("#example").DataTable({
        paging: false,
        orderCellsTop: true,
        fixedHeader: true,
        aaSorting: [],
        dom: "Bfrti",
        buttons: [
            {
                text: "JSON",
                action: function (e, dt, button, config) {
                    var data = dt.buttons.exportData();

                    const r = [];
                    for (const b of data.body) {
                        const prep = {};
                        data.header.forEach((v, i) => {
                            const key = v.toLowerCase().replace(" ", "_");
                            prep[key] = b[i];
                        });
                        r.push(prep);
                    }

                    $.fn.dataTable.fileSave(
                        new Blob([JSON.stringify({ missions: r })]),
                        "missions.json"
                    );
                },
            },
            {
                text: "CSV",
                action: function (e, dt, button, config) {
                    var data = dt.buttons.exportData();

                    const r = [];
                    r.push(data.header.join(","));
                    for (const mission of data.body) {
                        r.push(
                            mission
                                .map((m) => {
                                    if (m.includes(",")) return `"${m}"`;
                                    else return m;
                                })
                                .join(",")
                        );
                    }

                    $.fn.dataTable.fileSave(
                        new Blob([r.join("\n")]),
                        "missions.csv"
                    );
                },
            },
        ],
        initComplete: function () {
            var api = this.api();

            // For each column
            api.columns()
                .eq(0)
                .each(function (colIdx) {
                    // Set the header cell to contain the input element
                    var cell = $(".filters th").eq(
                        $(api.column(colIdx).header()).index()
                    );
                    var title = $(cell).text();
                    if ($(api.column(colIdx).header()).index() >= 0) {
                        $(cell).html(
                            '<input type="text" placeholder="' + title + '"/>'
                        );
                    }

                    // On every keypress in this input
                    $(
                        "input",
                        $(".filters th").eq(
                            $(api.column(colIdx).header()).index()
                        )
                    )
                        .off("keyup")
                        .on("keyup", function (e) {
                            api.column(colIdx)
                                .search(this.value, true, false)
                                .draw();
                        });
                });
        },
    });

    fetch("/api/missions")
        .then((response) => response.json())
        .then((data) => {
            for (const mission of data) {
                table.row
                    .add([
                        mission.mission_name,
                        mission.launch_date,
                        mission.launch_site,
                        mission.crew.map((c) => c.astronaut_name).join(", "),
                        mission.launch_vehicle,
                        mission.command_module,
                        mission.lunar_module,
                        mission.duration,
                        mission.remarks,
                        mission.wiki_page.replace("https://en.", ""),
                    ])
                    .draw();
            }
        });
});
