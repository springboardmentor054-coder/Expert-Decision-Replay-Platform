// Dashboard Page Script
// Depends on: main.js (Auth, API_BASE, formatDate, getStatusBadge)

async function loadDashboard() {
    var token = Auth.getToken();

    // 1. Fetch Stats from Dashboard API
    try {
        var res = await fetch(API_BASE + "/analytics/dashboard", {
            headers: Auth.getHeaders()
        });
        if (res.ok) {
            var stats = await res.json();
            document.getElementById("stat-total-decisions").textContent = stats.total_decisions;
            document.getElementById("stat-pending-reviews").textContent = stats.status_distribution["Under Review"] || 0;
            document.getElementById("stat-my-decisions").textContent = stats.my_decisions_count;
            document.getElementById("stat-turnaround").textContent = stats.avg_approval_turnaround_hours;

            // Render activities widget
            var activitiesContainer = document.getElementById("recent-activities-list");
            activitiesContainer.innerHTML = "";
            if (stats.recent_activities.length === 0) {
                var emptyDiv = document.createElement("div");
                emptyDiv.style.color = "var(--text-muted)";
                emptyDiv.textContent = "No activity logged.";
                activitiesContainer.appendChild(emptyDiv);
            } else {
                stats.recent_activities.forEach(function(act) {
                    var actItem = document.createElement("div");
                    actItem.style.borderBottom = "1px solid var(--border-color)";
                    actItem.style.paddingBottom = "8px";

                    var headerDiv = document.createElement("div");
                    headerDiv.style.display = "flex";
                    headerDiv.style.justifyContent = "space-between";
                    headerDiv.style.fontWeight = "600";
                    headerDiv.style.color = "white";

                    var actionSpan = document.createElement("span");
                    actionSpan.textContent = act.action;
                    headerDiv.appendChild(actionSpan);

                    var timeSpan = document.createElement("span");
                    timeSpan.style.fontWeight = "normal";
                    timeSpan.style.color = "var(--text-muted)";
                    timeSpan.style.fontSize = "0.75rem";
                    timeSpan.textContent = formatDate(act.timestamp);
                    headerDiv.appendChild(timeSpan);

                    var detailDiv = document.createElement("div");
                    detailDiv.style.color = "var(--text-secondary)";
                    detailDiv.style.marginTop = "4px";
                    detailDiv.textContent = act.details;

                    var userDiv = document.createElement("div");
                    userDiv.style.color = "var(--text-muted)";
                    userDiv.style.fontSize = "0.75rem";
                    userDiv.style.marginTop = "2px";
                    userDiv.textContent = "User: " + act.user_email;

                    actItem.appendChild(headerDiv);
                    actItem.appendChild(detailDiv);
                    actItem.appendChild(userDiv);
                    activitiesContainer.appendChild(actItem);
                });
            }
        }
    } catch (err) {
        console.error("Could not load stats", err);
    }

    // 2. Fetch Decisions list
    await filterDecisions();

    // 3. Fetch Pending approvals
    try {
        var appRes = await fetch(API_BASE + "/approvals/pending", {
            headers: Auth.getHeaders()
        });
        if (appRes.ok) {
            var approvals = await appRes.json();
            document.getElementById("badge-pending-count").textContent = approvals.length;

            var container = document.getElementById("pending-reviews-list");
            container.innerHTML = "";
            if (approvals.length === 0) {
                var emptyReview = document.createElement("div");
                emptyReview.style.color = "var(--text-secondary)";
                emptyReview.style.fontSize = "0.9rem";
                emptyReview.textContent = "All caught up! No reviews pending.";
                container.appendChild(emptyReview);
            } else {
                approvals.forEach(function(app) {
                    var div = document.createElement("div");
                    div.className = "card";
                    div.style.padding = "12px";
                    div.style.background = "rgba(255, 255, 255, 0.02)";
                    div.style.border = "1px solid var(--border-color)";

                    var titleDiv = document.createElement("div");
                    titleDiv.style.fontWeight = "600";
                    titleDiv.style.fontSize = "0.9rem";
                    titleDiv.style.marginBottom = "4px";
                    var titleLink = document.createElement("a");
                    titleLink.href = "/decisions/" + app.decision_id;
                    titleLink.textContent = "Decision #" + app.decision_id;
                    titleDiv.appendChild(titleLink);

                    var levelDiv = document.createElement("div");
                    levelDiv.style.color = "var(--text-secondary)";
                    levelDiv.style.fontSize = "0.8rem";
                    levelDiv.style.marginBottom = "8px";
                    levelDiv.textContent = "Level " + app.level + " Review";

                    var btnDiv = document.createElement("div");
                    btnDiv.style.display = "flex";
                    btnDiv.style.gap = "8px";

                    var approveBtn = document.createElement("button");
                    approveBtn.className = "btn btn-primary";
                    approveBtn.style.padding = "4px 8px";
                    approveBtn.style.fontSize = "0.75rem";
                    approveBtn.textContent = "Approve";
                    approveBtn.setAttribute("data-approval-id", app.id);
                    approveBtn.setAttribute("data-status", "Approved");
                    approveBtn.addEventListener("click", function() {
                        actionApprove(app.id, "Approved");
                    });

                    var rejectBtn = document.createElement("button");
                    rejectBtn.className = "btn btn-danger";
                    rejectBtn.style.padding = "4px 8px";
                    rejectBtn.style.fontSize = "0.75rem";
                    rejectBtn.style.background = "var(--color-danger)";
                    rejectBtn.textContent = "Reject";
                    rejectBtn.addEventListener("click", function() {
                        actionApprove(app.id, "Rejected");
                    });

                    btnDiv.appendChild(approveBtn);
                    btnDiv.appendChild(rejectBtn);

                    div.appendChild(titleDiv);
                    div.appendChild(levelDiv);
                    div.appendChild(btnDiv);
                    container.appendChild(div);
                });
            }
        }
    } catch (err) {
        console.error("Could not fetch pending reviews", err);
    }
}

async function actionApprove(approvalId, status) {
    var comments = prompt("Enter comments for " + status + ":", "Proceeding with " + status);
    if (comments === null) return;

    try {
        var res = await fetch(API_BASE + "/approvals/" + approvalId + "/action", {
            method: "POST",
            headers: Auth.getHeaders(),
            body: JSON.stringify({
                status: status,
                comments: comments
            })
        });
        if (res.ok) {
            alert("Decision successfully " + status + ".");
            loadDashboard();
        } else {
            var err = await res.json();
            alert("Error actioning approval: " + err.detail);
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteDecision(decisionId, title) {
    if (confirm("Are you sure you want to delete decision #" + decisionId + ': "' + title + '"?')) {
        try {
            var res = await fetch(API_BASE + "/decisions/" + decisionId, {
                method: "DELETE",
                headers: Auth.getHeaders()
            });
            if (res.ok) {
                alert("Decision deleted successfully.");
                loadDashboard();
            } else {
                var err = await res.json();
                alert("Could not delete decision: " + err.detail);
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    }
}

async function filterDecisions() {
    var search = document.getElementById("search-filter").value;
    var category = document.getElementById("category-filter").value;
    var status = document.getElementById("status-filter").value;
    var currentUser = Auth.getUser();

    var url = API_BASE + "/decisions/?";
    if (search) url += "search=" + encodeURIComponent(search) + "&";
    if (category) url += "category=" + encodeURIComponent(category) + "&";
    if (status) url += "status=" + encodeURIComponent(status) + "&";

    try {
        var res = await fetch(url, {
            headers: Auth.getHeaders()
        });
        if (res.ok) {
            var decisions = await res.json();
            var tbody = document.querySelector("#decisions-table tbody");
            tbody.innerHTML = "";

            if (decisions.length === 0) {
                var emptyTr = document.createElement("tr");
                var emptyTd = document.createElement("td");
                emptyTd.colSpan = 7;
                emptyTd.style.textAlign = "center";
                emptyTd.style.color = "var(--text-secondary)";
                emptyTd.style.padding = "40px";
                emptyTd.textContent = "No decisions found matching the filter criteria.";
                emptyTr.appendChild(emptyTd);
                tbody.appendChild(emptyTr);
                return;
            }

            decisions.forEach(function(d) {
                var tr = document.createElement("tr");
                var canDelete = currentUser && (d.creator_id === currentUser.id || currentUser.role === "Administrator" || currentUser.role === "Manager");
                var canEdit = canDelete;

                // ID cell
                var tdId = document.createElement("td");
                var strongId = document.createElement("strong");
                strongId.textContent = "#" + d.id;
                tdId.appendChild(strongId);
                tr.appendChild(tdId);

                // Title cell
                var tdTitle = document.createElement("td");
                tdTitle.style.fontWeight = "600";
                tdTitle.style.color = "white";
                var titleLink = document.createElement("a");
                titleLink.href = "/decisions/" + d.id;
                titleLink.style.color = "white";
                titleLink.style.textDecoration = "none";
                titleLink.textContent = d.title;
                tdTitle.appendChild(titleLink);
                tr.appendChild(tdTitle);

                // Category cell
                var tdCat = document.createElement("td");
                tdCat.textContent = d.category;
                tr.appendChild(tdCat);

                // Status cell
                var tdStatus = document.createElement("td");
                tdStatus.innerHTML = getStatusBadge(d.status);
                tr.appendChild(tdStatus);

                // Creator cell
                var tdCreator = document.createElement("td");
                tdCreator.textContent = d.creator ? d.creator.full_name : "Unknown";
                tr.appendChild(tdCreator);

                // Date cell
                var tdDate = document.createElement("td");
                tdDate.style.color = "var(--text-muted)";
                tdDate.style.fontSize = "0.85rem";
                tdDate.textContent = formatDate(d.created_at);
                tr.appendChild(tdDate);

                // Actions cell
                var tdActions = document.createElement("td");
                tdActions.style.textAlign = "right";

                var viewLink = document.createElement("a");
                viewLink.href = "/decisions/" + d.id;
                viewLink.className = "btn btn-secondary btn-sm";
                viewLink.style.marginRight = "4px";
                viewLink.style.textDecoration = "none";
                viewLink.textContent = "\uD83D\uDC41\uFE0F View";
                tdActions.appendChild(viewLink);

                if (canEdit) {
                    var editLink = document.createElement("a");
                    editLink.href = "/decisions/" + d.id + "/edit";
                    editLink.className = "btn btn-secondary btn-sm";
                    editLink.style.marginRight = "4px";
                    editLink.style.textDecoration = "none";
                    editLink.textContent = "\u270F\uFE0F Edit";
                    tdActions.appendChild(editLink);
                }

                if (canDelete) {
                    var deleteBtn = document.createElement("button");
                    deleteBtn.className = "btn btn-danger btn-sm";
                    deleteBtn.textContent = "\uD83D\uDDD1\uFE0F Delete";
                    (function(id, t) {
                        deleteBtn.addEventListener("click", function() {
                            deleteDecision(id, t);
                        });
                    })(d.id, d.title);
                    tdActions.appendChild(deleteBtn);
                }

                tr.appendChild(tdActions);
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Could not fetch decisions list", err);
    }
}

// Set up filters triggers
document.getElementById("search-filter").addEventListener("input", filterDecisions);
document.getElementById("category-filter").addEventListener("change", filterDecisions);
document.getElementById("status-filter").addEventListener("change", filterDecisions);

// Load initially
window.addEventListener("DOMContentLoaded", function() {
    setTimeout(loadDashboard, 300);
});
