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

// Renders the Kendo UI Grid
function renderGrid(groupedData) {
    $("#grid").kendoGrid({
        dataSource: {
            data: groupedData,
            pageSize: 10
        },
        pageable: true,
        sortable: true,
        columns: [
            { field: "WorkflowID", title: "Workflow ID", width: "120px" },
            { field: "WorkflowName", title: "Workflow Name" },
            { field: "DocumentName", title: "Document Name", width: "200px" },
            { field: "CreatedBy", title: "Created By" }
        ],
        detailTemplate: kendo.template($("#detail-template").html()),
        detailInit: detailInit,
        dataBound: function () {
            this.expandRow(this.tbody.find("tr.k-master-row").first());
        }
    });
}

// Initializes detail grid per row
def detailInit(e) {
    $("<div/>").appendTo(e.detailCell).kendoGrid({
        dataSource: {
            data: e.data.Steps,
            pageSize: 5
        },
        scrollable: false,
        pageable: true,
        columns: [
            { field: "StepID", title: "Step ID", width: "100px" },
            { field: "StepName", title: "Step Name" },
            { field: "StepData", title: "Step Data" },
            {
                field: "CreatedDate",
                title: "Created Date",
                template: "#= kendo.toString(kendo.parseDate(CreatedDate), 'yyyy-MM-dd HH:mm') #"
            }
        ]
    });
}
