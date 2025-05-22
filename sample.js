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

// Formats JSON with eye icon that opens a popup window
function formatStepDataJSON(jsonStr) {
    const json = JSON.parse(jsonStr);
    const pretty = JSON.stringify(json, null, 2);
    const uid = `json-${Math.random().toString(36).substr(2, 9)}`;

    return `
        <span class="k-icon k-i-eye" title="View JSON" style="cursor:pointer;" onclick="showJsonModal(\`${uid}\`)" data-json='${pretty.replace(/'/g, "&#39;")}' id="${uid}-icon"></span>
        <textarea id="${uid}-data" style="display:none;">${pretty}</textarea>
    `;
}

function showJsonModal(uid) {
    const json = document.getElementById(`${uid}-data`).value;
    const wnd = $("<div />").kendoWindow({
        title: "Step Data",
        modal: true,
        visible: false,
        resizable: true,
        width: "600px",
        actions: ["Close"],
        close: function () {
            this.destroy();
        }
    }).data("kendoWindow");

    const content = `
        <div style="padding:10px">
            <pre style="background:#f5f5f5;border:1px solid #ccc;padding:10px;max-height:400px;overflow:auto;font-family:monospace;white-space:pre-wrap;">${json}</pre>
            <button class="k-button k-primary" onclick="copyJsonToClipboard(\`${uid}\`)" style="margin-top:10px">Copy JSON</button>
        </div>
    `;

    wnd.content(content).center().open();
}

function copyJsonToClipboard(uid) {
    const textarea = document.getElementById(`${uid}-data`);
    textarea.style.display = "block";
    textarea.select();
    document.execCommand("copy");
    textarea.style.display = "none";
    alert("JSON copied to clipboard.");
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
        detailInit: function(e) {
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
                        width: "100px",
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
</script>

<style>
.hidden {
    display: none;
}
</style>
