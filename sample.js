<!-- HTML layout for grid -->
<input type="text" id="grid-search" placeholder="Search..." style="margin-bottom: 10px; padding: 5px; width: 300px;">
<div id="workflowAuditGrid"></div>

<!-- Kendo UI detail template -->
<script type="text/x-kendo-template" id="audit-detail-template">
    <div class="step-details"></div>
</script>

<!-- JavaScript code -->
<script>
// Entry point
document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/workflows")
        .then(response => {
            if (!response.ok) throw new Error("Failed to load data");
            return response.json();
        })
        .then(data => {
            const groupedData = groupByWorkflow(data);
            renderGrid(groupedData);
        })
        .catch(error => {
            console.error("Error fetching workflow data:", error);
            alert("Unable to load workflows.");
        });
});

// Groups step data by WorkflowID
function groupByWorkflow(data) {
    const workflowMap = new Map();

    data.forEach(step => {
        const workflowID = step.WorkflowID;
        if (!workflowMap.has(workflowID)) {
            workflowMap.set(workflowID, []);
        }
        workflowMap.get(workflowID).push(step);
    });

    return Array.from(workflowMap.entries()).map(([workflowID, steps]) => {
        const firstStep = steps[0];

        return {
            WorkflowID: workflowID,
            WorkflowName: firstStep.WorkflowName,
            CreatedBy: firstStep.CreatedBy,
            DocumentName: extractDocumentName(firstStep.StepData),
            Steps: steps
        };
    });
}

// Extracts documentName from StepData JSON
function extractDocumentName(stepData) {
    try {
        const parsed = JSON.parse(stepData);
        return parsed.documentName || "(No documentName)";
    } catch (e) {
        return "(Invalid JSON)";
    }
}

// Formats JSON as collapsible UI block with expand/collapse
function formatStepDataJSON(jsonStr) {
    try {
        const json = JSON.parse(jsonStr);
        const pretty = JSON.stringify(json, null, 2);
        const id = `json-${Math.random().toString(36).substr(2, 9)}`;
        return `
            <div class="json-toggle-wrapper">
                <span class="json-toggle k-icon k-i-plus" onclick="toggleJson('${id}', this)"></span>
                <pre id="${id}" class='json-viewer hidden'>${pretty}</pre>
            </div>
        `;
    } catch {
        return `<span style='color: red;'>(Invalid JSON)</span>`;
    }
}

// Toggle JSON visibility
function toggleJson(id, el) {
    const pre = document.getElementById(id);
    if (pre.classList.contains("hidden")) {
        pre.classList.remove("hidden");
        el.classList.remove("k-i-plus");
        el.classList.add("k-i-minus");
    } else {
        pre.classList.add("hidden");
        el.classList.remove("k-i-minus");
        el.classList.add("k-i-plus");
    }
}

// Renders the Kendo UI Grid
function renderGrid(groupedData) {
    const grid = $("#workflowAuditGrid").kendoGrid({
        dataSource: {
            data: groupedData,
            pageSize: 10,
            schema: {
                model: {
                    fields: {
                        WorkflowID: { type: "string" },
                        WorkflowName: { type: "string" },
                        DocumentName: { type: "string" },
                        CreatedBy: { type: "string" }
                    }
                }
            }
        },
        pageable: true,
        sortable: true,
        filterable: true,
        columns: [
            { field: "WorkflowID", title: "Workflow ID", width: "150px" },
            { field: "WorkflowName", title: "Workflow Name", width: "200px" },
            { field: "DocumentName", title: "Document Name", width: "250px" },
            { field: "CreatedBy", title: "Created By", width: "150px" }
        ],
        detailTemplate: kendo.template($("#audit-detail-template").html()),
        detailInit: detailInit,
        dataBound: function () {
            const rows = this.tbody.find("tr.k-master-row");
            rows.each(function () {
                const iconCell = $(this).find("td.k-hierarchy-cell").first();
                const icon = iconCell.find(".k-icon");
                icon.removeClass("k-i-expand k-i-collapse").addClass("k-i-plus");
            });
        },
        expand: function (e) {
            const icon = $(e.masterRow).find(".k-icon");
            icon.removeClass("k-i-plus").addClass("k-i-minus");
        },
        collapse: function (e) {
            const icon = $(e.masterRow).find(".k-icon");
            icon.removeClass("k-i-minus").addClass("k-i-plus");
        }
    }).data("kendoGrid");

    $("#grid-search").on("input", function () {
        const value = $(this).val();
        grid.dataSource.filter({
            logic: "or",
            filters: [
                { field: "WorkflowID", operator: "contains", value },
                { field: "WorkflowName", operator: "contains", value },
                { field: "DocumentName", operator: "contains", value },
                { field: "CreatedBy", operator: "contains", value }
            ]
        });
    });
}

// Initializes detail grid per row
function detailInit(e) {
    $("<div/>").appendTo(e.detailCell).kendoGrid({
        dataSource: {
            data: e.data.Steps,
            pageSize: 5
        },
        scrollable: false,
        pageable: true,
        columns: [
            { field: "StepID", title: "Step ID", width: "120px" },
            { field: "StepName", title: "Step Name", width: "200px" },
            {
                field: "StepData",
                title: "Step Data",
                width: "400px",
                encoded: false,
                template: function(dataItem) {
                    return formatStepDataJSON(dataItem.StepData);
                }
            },
            {
                field: "CreatedDate",
                title: "Created Date",
                template: "#= kendo.toString(kendo.parseDate(CreatedDate), 'yyyy-MM-dd HH:mm') #",
                width: "180px"
            }
        ]
    });
}
</script>

<style>
.json-viewer {
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    font-family: monospace;
    white-space: pre-wrap;
    max-height: 300px;
    overflow: auto;
    margin-top: 5px;
}

.hidden {
    display: none;
}

.json-toggle {
    cursor: pointer;
    display: inline-block;
    margin-bottom: 5px;
    font-size: 14px;
}

.json-toggle-wrapper {
    margin-bottom: 5px;
}
</style>
