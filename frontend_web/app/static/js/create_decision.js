// Create Decision Page Script
// Depends on: main.js (Auth, API_BASE)

var approversListCache = [];

// Fetch Reviewers & Managers to cache
async function fetchApprovers() {
    try {
        var reviewersRes = await fetch(API_BASE + "/users/roles/Reviewer", { headers: Auth.getHeaders() });
        var managersRes = await fetch(API_BASE + "/users/roles/Manager", { headers: Auth.getHeaders() });

        var reviewers = [];
        var managers = [];

        if (reviewersRes.ok) reviewers = await reviewersRes.json();
        if (managersRes.ok) managers = await managersRes.json();

        approversListCache = reviewers.concat(managers);

        // Populate existing row
        populateApproverSelect(document.querySelector(".app-user-id"));
    } catch (err) {
        console.error("Could not load approvers", err);
    }
}

function populateApproverSelect(selectElement) {
    if (!selectElement) return;
    var defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Choose Approver (Reviewer/Manager) --";
    selectElement.innerHTML = "";
    selectElement.appendChild(defaultOpt);
    approversListCache.forEach(function(u) {
        var opt = document.createElement("option");
        opt.value = u.id;
        opt.textContent = u.full_name + " (" + u.role + " - " + (u.team || "No Team") + ")";
        selectElement.appendChild(opt);
    });
}

// Add dynamic Alternative Block
document.getElementById("add-alternative-btn").addEventListener("click", function() {
    var container = document.getElementById("alternatives-container");
    var count = container.querySelectorAll(".alternative-block").length + 1;

    var div = document.createElement("div");
    div.className = "alternative-block card";
    div.style.background = "rgba(255, 255, 255, 0.01)";
    div.style.border = "1px dashed var(--border-color)";

    // Build the alternative block using DOM API
    var headerRow = document.createElement("div");
    headerRow.style.display = "flex";
    headerRow.style.justifyContent = "space-between";
    headerRow.style.marginBottom = "15px";

    var indexTitle = document.createElement("h4");
    indexTitle.className = "alt-index-title";
    indexTitle.textContent = "Alternative Option #" + count;
    headerRow.appendChild(indexTitle);

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-danger delete-alt-btn";
    deleteBtn.style.padding = "4px 8px";
    deleteBtn.style.fontSize = "0.75rem";
    deleteBtn.textContent = "Delete";
    headerRow.appendChild(deleteBtn);

    div.appendChild(headerRow);

    // Title input
    var titleGroup = document.createElement("div");
    titleGroup.className = "form-group";
    var titleLabel = document.createElement("label");
    titleLabel.className = "form-label";
    titleLabel.textContent = "Option Name / Title";
    var titleInput = document.createElement("input");
    titleInput.className = "form-control alt-title";
    titleInput.type = "text";
    titleInput.required = true;
    titleInput.placeholder = "e.g. Alternative name";
    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    div.appendChild(titleGroup);

    // Description textarea
    var descGroup = document.createElement("div");
    descGroup.className = "form-group";
    var descLabel = document.createElement("label");
    descLabel.className = "form-label";
    descLabel.textContent = "Description & Solution Overview";
    var descTextarea = document.createElement("textarea");
    descTextarea.className = "form-control alt-desc";
    descTextarea.required = true;
    descTextarea.placeholder = "Describe this alternative option...";
    descGroup.appendChild(descLabel);
    descGroup.appendChild(descTextarea);
    div.appendChild(descGroup);

    // Cost / Feasibility / Risk grid
    var gridRow1 = document.createElement("div");
    gridRow1.className = "grid-stats";
    gridRow1.style.gridTemplateColumns = "1fr 1fr 1fr";
    gridRow1.style.marginBottom = "15px";

    // Cost
    var costGroup = document.createElement("div");
    costGroup.className = "form-group";
    var costLabel = document.createElement("label");
    costLabel.className = "form-label";
    costLabel.textContent = "Est. Cost ($ / Year)";
    var costInput = document.createElement("input");
    costInput.className = "form-control alt-cost";
    costInput.type = "number";
    costInput.step = "any";
    costInput.value = "0";
    costGroup.appendChild(costLabel);
    costGroup.appendChild(costInput);
    gridRow1.appendChild(costGroup);

    // Feasibility
    var feasGroup = document.createElement("div");
    feasGroup.className = "form-group";
    var feasLabel = document.createElement("label");
    feasLabel.className = "form-label";
    feasLabel.textContent = "Feasibility (1-5)";
    var feasSelect = document.createElement("select");
    feasSelect.className = "form-control alt-feasibility";
    [["5", "5 - Extremely Feasible"], ["4", "4 - High Feasibility"], ["3", "3 - Medium Feasibility"], ["2", "2 - Low Feasibility"], ["1", "1 - Blocked / Highly Difficult"]].forEach(function(item) {
        var opt = document.createElement("option");
        opt.value = item[0];
        opt.textContent = item[1];
        if (item[0] === "3") opt.selected = true;
        feasSelect.appendChild(opt);
    });
    feasGroup.appendChild(feasLabel);
    feasGroup.appendChild(feasSelect);
    gridRow1.appendChild(feasGroup);

    // Risk
    var riskGroup = document.createElement("div");
    riskGroup.className = "form-group";
    var riskLabel = document.createElement("label");
    riskLabel.className = "form-label";
    riskLabel.textContent = "Risk Level (1-5)";
    var riskSelect = document.createElement("select");
    riskSelect.className = "form-control alt-risk";
    [["1", "1 - Negligible Risk"], ["2", "2 - Low Risk"], ["3", "3 - Medium Risk"], ["4", "4 - High Risk"], ["5", "5 - Critical Risk"]].forEach(function(item) {
        var opt = document.createElement("option");
        opt.value = item[0];
        opt.textContent = item[1];
        if (item[0] === "3") opt.selected = true;
        riskSelect.appendChild(opt);
    });
    riskGroup.appendChild(riskLabel);
    riskGroup.appendChild(riskSelect);
    gridRow1.appendChild(riskGroup);

    div.appendChild(gridRow1);

    // Pros / Cons grid
    var gridRow2 = document.createElement("div");
    gridRow2.className = "grid-stats";
    gridRow2.style.gridTemplateColumns = "1fr 1fr";
    gridRow2.style.marginBottom = "15px";

    var prosGroup = document.createElement("div");
    prosGroup.className = "form-group";
    var prosLabel = document.createElement("label");
    prosLabel.className = "form-label";
    prosLabel.textContent = "Pros (Comma separated list)";
    var prosInput = document.createElement("input");
    prosInput.className = "form-control alt-pros";
    prosInput.type = "text";
    prosInput.placeholder = "Managed backups, high availability";
    prosGroup.appendChild(prosLabel);
    prosGroup.appendChild(prosInput);
    gridRow2.appendChild(prosGroup);

    var consGroup = document.createElement("div");
    consGroup.className = "form-group";
    var consLabel = document.createElement("label");
    consLabel.className = "form-label";
    consLabel.textContent = "Cons (Comma separated list)";
    var consInput = document.createElement("input");
    consInput.className = "form-control alt-cons";
    consInput.type = "text";
    consInput.placeholder = "Vendor lock-in, higher cost";
    consGroup.appendChild(consLabel);
    consGroup.appendChild(consInput);
    gridRow2.appendChild(consGroup);

    div.appendChild(gridRow2);

    // Mitigation textarea
    var mitGroup = document.createElement("div");
    mitGroup.className = "form-group";
    var mitLabel = document.createElement("label");
    mitLabel.className = "form-label";
    mitLabel.textContent = "Risk Mitigation Plan";
    var mitTextarea = document.createElement("textarea");
    mitTextarea.className = "form-control alt-mitigation";
    mitTextarea.placeholder = "Describe backup plans or migration fallback...";
    mitGroup.appendChild(mitLabel);
    mitGroup.appendChild(mitTextarea);
    div.appendChild(mitGroup);

    // Wire delete event
    deleteBtn.addEventListener("click", function() {
        div.remove();
        reindexAlternatives();
    });

    container.appendChild(div);

    // Show all delete buttons if count > 1
    var allBlocks = container.querySelectorAll(".alternative-block");
    if (allBlocks.length > 1) {
        allBlocks.forEach(function(block) {
            block.querySelector(".delete-alt-btn").style.display = "block";
        });
    }
});

function reindexAlternatives() {
    var container = document.getElementById("alternatives-container");
    var blocks = container.querySelectorAll(".alternative-block");
    blocks.forEach(function(block, index) {
        block.querySelector(".alt-index-title").textContent = "Alternative Option #" + (index + 1);
    });
    if (blocks.length === 1) {
        blocks[0].querySelector(".delete-alt-btn").style.display = "none";
    }
}

// Add dynamic Approver level
document.getElementById("add-approver-btn").addEventListener("click", function() {
    var container = document.getElementById("approvers-container");
    var count = container.querySelectorAll(".approver-row").length + 1;

    var div = document.createElement("div");
    div.className = "approver-row";
    div.style.display = "grid";
    div.style.gridTemplateColumns = "1fr 2fr auto";
    div.style.gap = "15px";
    div.style.alignItems = "center";
    div.style.marginTop = "10px";

    var levelDiv = document.createElement("div");
    var levelInput = document.createElement("input");
    levelInput.className = "form-control app-level";
    levelInput.type = "number";
    levelInput.readOnly = true;
    levelInput.value = count;
    levelDiv.appendChild(levelInput);
    div.appendChild(levelDiv);

    var selectDiv = document.createElement("div");
    var selectEl = document.createElement("select");
    selectEl.className = "form-control app-user-id";
    selectEl.required = true;
    selectDiv.appendChild(selectEl);
    div.appendChild(selectDiv);

    populateApproverSelect(selectEl);

    var btnDiv = document.createElement("div");
    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-danger delete-app-btn";
    delBtn.style.padding = "10px 14px";
    delBtn.style.fontSize = "0.85rem";
    delBtn.textContent = "\uD83D\uDDD1\uFE0F";
    delBtn.addEventListener("click", function() {
        div.remove();
        reindexApprovers();
    });
    btnDiv.appendChild(delBtn);
    div.appendChild(btnDiv);

    container.appendChild(div);
    reindexApprovers();
});

function reindexApprovers() {
    var container = document.getElementById("approvers-container");
    var rows = container.querySelectorAll(".approver-row");
    rows.forEach(function(row, index) {
        row.querySelector(".app-level").value = index + 1;
    });
}

// Handle Submit
document.getElementById("decision-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    var title = document.getElementById("title").value;
    var category = document.getElementById("category").value;
    var status = document.getElementById("status").value;
    var problem = document.getElementById("problem_statement").value;
    var errMsg = document.getElementById("error-message");
    errMsg.style.display = "none";

    // Parse alternatives
    var alternatives = [];
    document.querySelectorAll(".alternative-block").forEach(function(block) {
        var altTitle = block.querySelector(".alt-title").value;
        var altDesc = block.querySelector(".alt-desc").value;
        var altCost = parseFloat(block.querySelector(".alt-cost").value) || 0.0;
        var altFeasibility = parseInt(block.querySelector(".alt-feasibility").value) || 3;
        var altRisk = parseInt(block.querySelector(".alt-risk").value) || 3;

        var prosRaw = block.querySelector(".alt-pros").value;
        var pros = prosRaw ? prosRaw.split(",").map(function(p) { return p.trim(); }).filter(function(p) { return p; }) : [];

        var consRaw = block.querySelector(".alt-cons").value;
        var cons = consRaw ? consRaw.split(",").map(function(c) { return c.trim(); }).filter(function(c) { return c; }) : [];

        var altMitigation = block.querySelector(".alt-mitigation").value;

        alternatives.push({
            title: altTitle,
            description: altDesc,
            cost: altCost,
            feasibility_rating: altFeasibility,
            risk_rating: altRisk,
            pros: pros,
            cons: cons,
            risk_mitigation: altMitigation
        });
    });

    // Parse approvers
    var requiredApprovers = [];
    document.querySelectorAll(".approver-row").forEach(function(row) {
        var level = parseInt(row.querySelector(".app-level").value);
        var approverId = row.querySelector(".app-user-id").value;
        if (approverId) {
            requiredApprovers.push({
                level: level,
                approver_id: parseInt(approverId)
            });
        }
    });

    // Check if Under Review, we MUST have approvers
    if (status === "Under Review" && requiredApprovers.length === 0) {
        errMsg.textContent = "Error: You must assign at least one approver to submit for review immediately.";
        errMsg.style.display = "block";
        return;
    }

    try {
        var response = await fetch(API_BASE + "/decisions/", {
            method: "POST",
            headers: Auth.getHeaders(),
            body: JSON.stringify({
                title: title,
                problem_statement: problem,
                category: category,
                status: status,
                alternatives: alternatives,
                required_approvers: requiredApprovers
            })
        });

        if (!response.ok) {
            var data = await response.json();
            throw new Error(data.detail || "Error saving decision.");
        }

        alert("Decision created successfully!");
        window.location.href = "/dashboard";
    } catch (err) {
        errMsg.textContent = err.message;
        errMsg.style.display = "block";
    }
});

window.addEventListener("DOMContentLoaded", function() {
    setTimeout(fetchApprovers, 300);
});
