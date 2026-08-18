// Decision Detail Page Script
// Depends on: main.js (Auth, API_BASE, formatDate, getStatusBadge, formatFileSize)

var currentUserId = null;
var currentUserRole = "";

document.getElementById("comment-file").addEventListener("change", function(e) {
    var nameEl = document.getElementById("file-selected-name");
    if (e.target.files.length > 0) {
        nameEl.textContent = e.target.files[0].name;
    } else {
        nameEl.textContent = "";
    }
});

async function loadDecisionDetails() {
    var user = Auth.getUser();
    if (user) {
        currentUserId = user.id;
        currentUserRole = user.role;
    }

    try {
        var res = await fetch(API_BASE + "/decisions/" + DECISION_ID, {
            headers: Auth.getHeaders()
        });

        if (!res.ok) {
            alert("Could not load decision details.");
            window.location.href = "/dashboard";
            return;
        }

        var d = await res.json();

        // Populate Details
        document.getElementById("decision-title").textContent = d.title;
        document.getElementById("decision-meta").textContent = "Category: " + d.category + " | Version: v" + d.current_version + " | Creator: " + d.creator.full_name + " (" + (d.creator.team || "No Team") + ")";
        document.getElementById("decision-problem").textContent = d.problem_statement;

        if (d.description) {
            document.getElementById("decision-description-wrapper").style.display = "block";
            document.getElementById("decision-description").textContent = d.description;
        }

        document.getElementById("decision-status-badge").innerHTML = getStatusBadge(d.status);

        // Populate Meeting Notes
        document.getElementById("notes-summary-text").textContent = d.meeting_summary || "No summary recorded.";
        document.getElementById("notes-conclusion-text").textContent = d.conclusion || "No conclusion recorded.";
        document.getElementById("notes-action-text").textContent = d.next_action || "No next action item recorded.";

        document.getElementById("input-meeting-summary").value = d.meeting_summary || "";
        document.getElementById("input-conclusion").value = d.conclusion || "";
        document.getElementById("input-next-action").value = d.next_action || "";

        // Show edit button for creator or admin/manager
        if (d.creator_id === currentUserId || currentUserRole === "Administrator" || currentUserRole === "Manager") {
            document.getElementById("edit-decision-btn").style.display = "inline-flex";
            if (d.status === "Draft") {
                document.getElementById("submit-review-btn").style.display = "inline-flex";
            }
            if (d.status !== "Archived") {
                document.getElementById("archive-btn").style.display = "inline-flex";
            }
        }

        // Render Alternatives
        var altContainer = document.getElementById("alternatives-wrapper");
        altContainer.innerHTML = "";

        if (d.alternatives) {
            d.alternatives.forEach(function(alt) {
                var feasibilityPct = alt.feasibility_rating * 20;
                var riskPct = alt.risk_rating * 20;

                var feasibilityClass = "medium";
                if (alt.feasibility_rating >= 4) feasibilityClass = "good";
                else if (alt.feasibility_rating <= 2) feasibilityClass = "bad";

                var riskClass = "medium";
                if (alt.risk_rating >= 4) riskClass = "bad";
                else if (alt.risk_rating <= 2) riskClass = "good";

                var card = document.createElement("div");
                card.className = "alternative-card";

                var titleDiv = document.createElement("div");
                titleDiv.className = "alternative-title";
                titleDiv.textContent = alt.title;
                card.appendChild(titleDiv);

                var descDiv = document.createElement("div");
                descDiv.style.fontSize = "0.85rem";
                descDiv.style.color = "var(--text-secondary)";
                descDiv.style.lineHeight = "1.5";
                descDiv.textContent = alt.description;
                card.appendChild(descDiv);

                // Feasibility bar
                var feasDiv = document.createElement("div");
                feasDiv.style.marginTop = "10px";
                var feasHeader = document.createElement("div");
                feasHeader.style.display = "flex";
                feasHeader.style.justifyContent = "space-between";
                feasHeader.style.fontSize = "0.8rem";
                feasHeader.style.marginBottom = "4px";
                var feasLabel = document.createElement("span");
                feasLabel.textContent = "Feasibility Score";
                var feasValue = document.createElement("span");
                feasValue.style.fontWeight = "600";
                feasValue.textContent = alt.feasibility_rating + " / 5";
                feasHeader.appendChild(feasLabel);
                feasHeader.appendChild(feasValue);
                feasDiv.appendChild(feasHeader);
                var feasBar = document.createElement("div");
                feasBar.className = "rating-bar";
                var feasFill = document.createElement("div");
                feasFill.className = "rating-fill " + feasibilityClass;
                feasFill.style.width = feasibilityPct + "%";
                feasBar.appendChild(feasFill);
                feasDiv.appendChild(feasBar);
                card.appendChild(feasDiv);

                // Risk bar
                var riskDiv = document.createElement("div");
                var riskHeader = document.createElement("div");
                riskHeader.style.display = "flex";
                riskHeader.style.justifyContent = "space-between";
                riskHeader.style.fontSize = "0.8rem";
                riskHeader.style.marginBottom = "4px";
                var riskLabel = document.createElement("span");
                riskLabel.textContent = "Risk Assessment";
                var riskValue = document.createElement("span");
                riskValue.style.fontWeight = "600";
                riskValue.textContent = alt.risk_rating + " / 5";
                riskHeader.appendChild(riskLabel);
                riskHeader.appendChild(riskValue);
                riskDiv.appendChild(riskHeader);
                var riskBar = document.createElement("div");
                riskBar.className = "rating-bar";
                var riskFill = document.createElement("div");
                riskFill.className = "rating-fill " + riskClass;
                riskFill.style.width = riskPct + "%";
                riskBar.appendChild(riskFill);
                riskDiv.appendChild(riskBar);
                card.appendChild(riskDiv);

                // Budget
                var budgetDiv = document.createElement("div");
                budgetDiv.style.fontSize = "0.85rem";
                budgetDiv.style.fontWeight = "500";
                budgetDiv.innerHTML = "Est. Budget: <span style='color: white; font-weight: 600;'>$" + alt.cost.toLocaleString() + " / year</span>";
                card.appendChild(budgetDiv);

                // Pros/Cons
                var proConDiv = document.createElement("div");
                proConDiv.className = "pro-con-list";
                (alt.pros || []).forEach(function(pro) {
                    var proItem = document.createElement("div");
                    proItem.className = "pro-con-item pro";
                    proItem.textContent = pro;
                    proConDiv.appendChild(proItem);
                });
                (alt.cons || []).forEach(function(con) {
                    var conItem = document.createElement("div");
                    conItem.className = "pro-con-item con";
                    conItem.textContent = con;
                    proConDiv.appendChild(conItem);
                });
                card.appendChild(proConDiv);

                // Risk Mitigation
                if (alt.risk_mitigation) {
                    var mitDiv = document.createElement("div");
                    mitDiv.style.marginTop = "10px";
                    mitDiv.style.padding = "8px";
                    mitDiv.style.borderRadius = "6px";
                    mitDiv.style.background = "rgba(239, 68, 68, 0.05)";
                    mitDiv.style.border = "1px solid rgba(239, 68, 68, 0.1)";
                    mitDiv.style.fontSize = "0.78rem";
                    mitDiv.innerHTML = "<strong style='color: var(--color-danger);'>Risk Mitigation:</strong> " + alt.risk_mitigation;
                    card.appendChild(mitDiv);
                }

                altContainer.appendChild(card);
            });
        }

        // Render Approvals Flow
        var appContainer = document.getElementById("approvals-container");
        appContainer.innerHTML = "";

        if (!d.approvals || d.approvals.length === 0) {
            var noApp = document.createElement("div");
            noApp.style.color = "var(--text-secondary)";
            noApp.style.fontSize = "0.9rem";
            noApp.textContent = "No governance reviews assigned.";
            appContainer.appendChild(noApp);
        } else {
            d.approvals.forEach(function(app) {
                var row = document.createElement("div");
                row.style.background = "rgba(255, 255, 255, 0.02)";
                row.style.border = "1px solid var(--border-color)";
                row.style.borderRadius = "8px";
                row.style.padding = "12px";

                // Header with name and badge
                var headerDiv = document.createElement("div");
                headerDiv.style.display = "flex";
                headerDiv.style.justifyContent = "space-between";
                headerDiv.style.alignItems = "center";
                headerDiv.style.fontWeight = "600";
                headerDiv.style.fontSize = "0.9rem";

                var nameSpan = document.createElement("span");
                nameSpan.textContent = "Level " + app.level + ": " + app.approver.full_name;
                headerDiv.appendChild(nameSpan);

                var badgeSpan = document.createElement("span");
                if (app.status === "Approved") {
                    badgeSpan.className = "badge badge-approved";
                    badgeSpan.textContent = "Approved";
                } else if (app.status === "Rejected") {
                    badgeSpan.className = "badge badge-rejected";
                    badgeSpan.textContent = "Rejected";
                } else {
                    badgeSpan.className = "badge badge-draft";
                    badgeSpan.textContent = "Pending";
                }
                headerDiv.appendChild(badgeSpan);
                row.appendChild(headerDiv);

                // Role info
                var roleDiv = document.createElement("div");
                roleDiv.style.fontSize = "0.78rem";
                roleDiv.style.color = "var(--text-muted)";
                roleDiv.style.marginTop = "2px";
                roleDiv.textContent = "Role: " + app.approver.role + " (" + (app.approver.team || "No Team") + ")";
                row.appendChild(roleDiv);

                // Comments
                if (app.comments) {
                    var commentDiv = document.createElement("div");
                    commentDiv.style.marginTop = "8px";
                    commentDiv.style.paddingTop = "8px";
                    commentDiv.style.borderTop = "1px dashed var(--border-color)";
                    commentDiv.style.fontSize = "0.85rem";
                    commentDiv.style.fontStyle = "italic";
                    commentDiv.style.color = "var(--text-secondary)";
                    commentDiv.textContent = '"' + app.comments + '"';
                    row.appendChild(commentDiv);
                }

                // Actioned at
                if (app.actioned_at) {
                    var actionedDiv = document.createElement("div");
                    actionedDiv.style.fontSize = "0.72rem";
                    actionedDiv.style.color = "var(--text-muted)";
                    actionedDiv.style.textAlign = "right";
                    actionedDiv.style.marginTop = "4px";
                    actionedDiv.textContent = "Actioned: " + formatDate(app.actioned_at);
                    row.appendChild(actionedDiv);
                }

                // Action buttons for pending approvals
                if (app.status === "Pending" && (app.approver_id === currentUserId || currentUserRole === "Manager" || currentUserRole === "Administrator")) {
                    var btnDiv = document.createElement("div");
                    btnDiv.style.display = "flex";
                    btnDiv.style.gap = "8px";
                    btnDiv.style.marginTop = "12px";
                    btnDiv.style.borderTop = "1px solid var(--border-color)";
                    btnDiv.style.paddingTop = "10px";

                    var approveBtn = document.createElement("button");
                    approveBtn.className = "btn btn-primary";
                    approveBtn.style.padding = "4px 10px";
                    approveBtn.style.fontSize = "0.75rem";
                    approveBtn.textContent = "Approve";
                    (function(id) {
                        approveBtn.addEventListener("click", function() { actionApprovalTask(id, "Approved"); });
                    })(app.id);

                    var rejectBtn = document.createElement("button");
                    rejectBtn.className = "btn btn-danger";
                    rejectBtn.style.padding = "4px 10px";
                    rejectBtn.style.fontSize = "0.75rem";
                    rejectBtn.textContent = "Reject";
                    (function(id) {
                        rejectBtn.addEventListener("click", function() { actionApprovalTask(id, "Rejected"); });
                    })(app.id);

                    btnDiv.appendChild(approveBtn);
                    btnDiv.appendChild(rejectBtn);
                    row.appendChild(btnDiv);
                }

                appContainer.appendChild(row);
            });
        }

        // Render Documents List
        var docContainer = document.getElementById("documents-container");
        docContainer.innerHTML = "";

        var allDocs = (d.documents || []).concat(d.attachments || []);
        if (allDocs.length === 0) {
            var noDoc = document.createElement("div");
            noDoc.style.color = "var(--text-secondary)";
            noDoc.style.fontSize = "0.9rem";
            noDoc.textContent = "No documents uploaded.";
            docContainer.appendChild(noDoc);
        } else {
            allDocs.forEach(function(doc) {
                var filename = doc.file_name || doc.filename;
                var filepath = doc.file_path;
                var filesize = doc.file_size ? formatFileSize(doc.file_size) : "";
                var docId = doc.id;
                var canDelete = doc.uploaded_by === currentUserId || doc.uploaded_by_id === currentUserId || currentUserRole === "Administrator" || currentUserRole === "Manager";

                var rowEl = document.createElement("div");
                rowEl.style.display = "flex";
                rowEl.style.justifyContent = "space-between";
                rowEl.style.alignItems = "center";
                rowEl.style.padding = "8px 12px";
                rowEl.style.background = "rgba(255,255,255,0.01)";
                rowEl.style.border = "1px solid var(--border-color)";
                rowEl.style.borderRadius = "6px";

                var infoDiv = document.createElement("div");
                infoDiv.style.overflow = "hidden";
                infoDiv.style.textOverflow = "ellipsis";
                infoDiv.style.whiteSpace = "nowrap";
                infoDiv.style.maxWidth = "170px";

                var nameDiv = document.createElement("div");
                nameDiv.style.fontWeight = "500";
                nameDiv.style.fontSize = "0.85rem";
                nameDiv.textContent = "\uD83D\uDCC4 " + filename;
                infoDiv.appendChild(nameDiv);

                if (filesize) {
                    var sizeDiv = document.createElement("div");
                    sizeDiv.style.fontSize = "0.72rem";
                    sizeDiv.style.color = "#94a3b8";
                    sizeDiv.textContent = filesize;
                    infoDiv.appendChild(sizeDiv);
                }
                rowEl.appendChild(infoDiv);

                var actionsDiv = document.createElement("div");
                actionsDiv.style.display = "flex";
                actionsDiv.style.gap = "4px";

                var viewLink = document.createElement("a");
                viewLink.className = "btn btn-secondary btn-sm";
                viewLink.style.padding = "4px 8px";
                viewLink.style.fontSize = "0.75rem";
                viewLink.style.textDecoration = "none";
                viewLink.href = "/static/uploads/" + filepath;
                viewLink.target = "_blank";
                viewLink.textContent = "View";
                actionsDiv.appendChild(viewLink);

                if (canDelete && doc.file_name) {
                    var delBtn = document.createElement("button");
                    delBtn.className = "btn btn-danger btn-sm";
                    delBtn.style.padding = "4px 8px";
                    delBtn.style.fontSize = "0.75rem";
                    delBtn.textContent = "\uD83D\uDDD1\uFE0F";
                    (function(id) {
                        delBtn.addEventListener("click", function() { deleteDocumentFromDetail(id); });
                    })(docId);
                    actionsDiv.appendChild(delBtn);
                }

                rowEl.appendChild(actionsDiv);
                docContainer.appendChild(rowEl);
            });
        }

        // Render Version history
        var versionContainer = document.getElementById("versions-container");
        versionContainer.innerHTML = "";

        if (d.versions) {
            d.versions.slice().reverse().forEach(function(v) {
                var rowEl = document.createElement("div");
                rowEl.className = "timeline-item";

                var headerDiv = document.createElement("div");
                headerDiv.className = "timeline-header";

                var versionSpan = document.createElement("span");
                versionSpan.className = "timeline-version";
                versionSpan.textContent = "Version v" + v.version;
                headerDiv.appendChild(versionSpan);

                var metaSpan = document.createElement("span");
                metaSpan.className = "timeline-meta";
                metaSpan.textContent = formatDate(v.created_at);
                headerDiv.appendChild(metaSpan);

                rowEl.appendChild(headerDiv);

                var contentDiv = document.createElement("div");
                contentDiv.className = "timeline-content";

                var summaryDiv = document.createElement("div");
                var summaryStrong = document.createElement("strong");
                summaryStrong.textContent = "Summary:";
                summaryDiv.appendChild(summaryStrong);
                summaryDiv.appendChild(document.createTextNode(" " + (v.change_summary || "Initial creation")));
                contentDiv.appendChild(summaryDiv);

                var editorDiv = document.createElement("div");
                editorDiv.style.fontSize = "0.78rem";
                editorDiv.style.color = "var(--text-muted)";
                editorDiv.style.marginTop = "2px";
                editorDiv.textContent = "Edited by: " + v.changed_by.full_name + " (" + v.changed_by.role + ") | Status: " + v.status;
                contentDiv.appendChild(editorDiv);

                rowEl.appendChild(contentDiv);
                versionContainer.appendChild(rowEl);
            });
        }

        // Render Comments
        renderComments(d.comments || []);

    } catch (err) {
        console.error("Error loading decision detail", err);
    }
}

async function deleteDocumentFromDetail(docId) {
    if (confirm("Delete this document?")) {
        try {
            var res = await fetch(API_BASE + "/documents/" + docId, {
                method: "DELETE",
                headers: Auth.getHeaders()
            });
            if (res.ok) {
                loadDecisionDetails();
            } else {
                alert("Could not delete document.");
            }
        } catch (err) {
            alert(err.message);
        }
    }
}

// Meeting Notes Toggle & Submit
document.getElementById("toggle-meeting-notes-btn").addEventListener("click", function() {
    var display = document.getElementById("meeting-notes-display");
    var form = document.getElementById("meeting-notes-form");
    if (form.style.display === "none") {
        form.style.display = "flex";
        display.style.display = "none";
    } else {
        form.style.display = "none";
        display.style.display = "block";
    }
});

document.getElementById("cancel-notes-btn").addEventListener("click", function() {
    document.getElementById("meeting-notes-form").style.display = "none";
    document.getElementById("meeting-notes-display").style.display = "block";
});

document.getElementById("meeting-notes-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    var summary = document.getElementById("input-meeting-summary").value.trim();
    var conclusion = document.getElementById("input-conclusion").value.trim();
    var nextAction = document.getElementById("input-next-action").value.trim();

    try {
        var res = await fetch(API_BASE + "/decisions/" + DECISION_ID + "/meeting-notes", {
            method: "PUT",
            headers: Auth.getHeaders(),
            body: JSON.stringify({
                meeting_summary: summary,
                conclusion: conclusion,
                next_action: nextAction
            })
        });

        if (res.ok) {
            document.getElementById("meeting-notes-form").style.display = "none";
            document.getElementById("meeting-notes-display").style.display = "block";
            loadDecisionDetails();
        } else {
            alert("Could not update meeting notes.");
        }
    } catch (err) {
        alert(err.message);
    }
});

// Threaded comments renderer
function renderComments(commentsList) {
    var container = document.getElementById("comments-container");
    container.innerHTML = "";

    if (commentsList.length === 0) {
        var emptyDiv = document.createElement("div");
        emptyDiv.style.color = "var(--text-secondary)";
        emptyDiv.style.fontSize = "0.95rem";
        emptyDiv.textContent = "No discussion items yet. Be the first to comment!";
        container.appendChild(emptyDiv);
        return;
    }

    function buildCommentElement(comment) {
        var canDelete = comment.user_id === currentUserId || currentUserRole === "Administrator" || currentUserRole === "Manager";
        var canEdit = comment.user_id === currentUserId;

        var card = document.createElement("div");
        card.className = "comment-card";
        card.id = "comment-" + comment.id;
        card.style.border = "1px solid #334155";
        card.style.borderRadius = "8px";
        card.style.padding = "14px";
        card.style.marginBottom = "12px";
        card.style.background = "#1e293b";

        // Header
        var headerDiv = document.createElement("div");
        headerDiv.className = "comment-header";
        headerDiv.style.display = "flex";
        headerDiv.style.justifyContent = "space-between";
        headerDiv.style.marginBottom = "8px";

        var authorSpan = document.createElement("span");
        authorSpan.className = "comment-author";
        authorSpan.style.fontWeight = "600";
        authorSpan.style.color = "#3b82f6";
        authorSpan.textContent = (comment.user ? comment.user.full_name : "User") + " (" + (comment.user ? comment.user.role : "Member") + ")";
        headerDiv.appendChild(authorSpan);

        var dateSpan = document.createElement("span");
        dateSpan.className = "comment-date";
        dateSpan.style.fontSize = "0.78rem";
        dateSpan.style.color = "#94a3b8";
        dateSpan.textContent = formatDate(comment.created_at);
        headerDiv.appendChild(dateSpan);

        card.appendChild(headerDiv);

        // Content
        var contentDiv = document.createElement("div");
        contentDiv.id = "comment-text-" + comment.id;
        contentDiv.style.fontSize = "0.9rem";
        contentDiv.style.lineHeight = "1.5";
        contentDiv.style.color = "white";
        contentDiv.textContent = comment.content || comment.comment;
        card.appendChild(contentDiv);

        // Attachments
        if (comment.attachments && comment.attachments.length > 0) {
            var attDiv = document.createElement("div");
            attDiv.style.marginTop = "10px";
            attDiv.style.display = "flex";
            attDiv.style.gap = "8px";
            attDiv.style.flexWrap = "wrap";
            comment.attachments.forEach(function(att) {
                var attLink = document.createElement("a");
                attLink.href = "/static/uploads/" + att.file_path;
                attLink.target = "_blank";
                attLink.style.fontSize = "0.75rem";
                attLink.style.background = "rgba(59,130,246,0.1)";
                attLink.style.border = "1px solid rgba(59,130,246,0.2)";
                attLink.style.padding = "2px 8px";
                attLink.style.borderRadius = "4px";
                attLink.style.display = "inline-flex";
                attLink.style.alignItems = "center";
                attLink.style.gap = "4px";
                attLink.style.color = "#60a5fa";
                attLink.style.textDecoration = "none";
                attLink.textContent = "\uD83D\uDCCE " + att.filename;
                attDiv.appendChild(attLink);
            });
            card.appendChild(attDiv);
        }

        // Action buttons
        var actionDiv = document.createElement("div");
        actionDiv.style.display = "flex";
        actionDiv.style.gap = "12px";
        actionDiv.style.marginTop = "10px";
        actionDiv.style.alignItems = "center";

        var replyBtn = document.createElement("button");
        replyBtn.className = "reply-btn";
        replyBtn.style.background = "none";
        replyBtn.style.border = "none";
        replyBtn.style.color = "#3b82f6";
        replyBtn.style.cursor = "pointer";
        replyBtn.style.fontSize = "0.8rem";
        replyBtn.textContent = "\uD83D\uDCAC Reply";
        (function(id) {
            replyBtn.addEventListener("click", function() { showReplyForm(id); });
        })(comment.id);
        actionDiv.appendChild(replyBtn);

        if (canEdit) {
            var editBtn = document.createElement("button");
            editBtn.style.background = "none";
            editBtn.style.border = "none";
            editBtn.style.color = "#f59e0b";
            editBtn.style.cursor = "pointer";
            editBtn.style.fontSize = "0.8rem";
            editBtn.textContent = "\u270F\uFE0F Edit";
            (function(id, text) {
                editBtn.addEventListener("click", function() { showEditCommentForm(id, text); });
            })(comment.id, comment.content || comment.comment);
            actionDiv.appendChild(editBtn);
        }

        if (canDelete) {
            var delBtn = document.createElement("button");
            delBtn.style.background = "none";
            delBtn.style.border = "none";
            delBtn.style.color = "#ef4444";
            delBtn.style.cursor = "pointer";
            delBtn.style.fontSize = "0.8rem";
            delBtn.textContent = "\uD83D\uDDD1\uFE0F Delete";
            (function(id) {
                delBtn.addEventListener("click", function() { deleteComment(id); });
            })(comment.id);
            actionDiv.appendChild(delBtn);
        }

        card.appendChild(actionDiv);

        // Edit form container
        var editContainer = document.createElement("div");
        editContainer.id = "edit-comment-container-" + comment.id;
        editContainer.style.marginTop = "10px";
        editContainer.style.display = "none";

        var editTextarea = document.createElement("textarea");
        editTextarea.className = "form-control";
        editTextarea.style.fontSize = "0.85rem";
        editTextarea.style.minHeight = "60px";
        editTextarea.id = "edit-comment-content-" + comment.id;
        editContainer.appendChild(editTextarea);

        var editBtnDiv = document.createElement("div");
        editBtnDiv.style.display = "flex";
        editBtnDiv.style.justifyContent = "flex-end";
        editBtnDiv.style.gap = "8px";
        editBtnDiv.style.marginTop = "8px";

        var cancelEditBtn = document.createElement("button");
        cancelEditBtn.className = "btn btn-secondary";
        cancelEditBtn.style.padding = "4px 8px";
        cancelEditBtn.style.fontSize = "0.75rem";
        cancelEditBtn.textContent = "Cancel";
        (function(id) {
            cancelEditBtn.addEventListener("click", function() { hideEditCommentForm(id); });
        })(comment.id);

        var saveEditBtn = document.createElement("button");
        saveEditBtn.className = "btn btn-primary";
        saveEditBtn.style.padding = "4px 8px";
        saveEditBtn.style.fontSize = "0.75rem";
        saveEditBtn.textContent = "Save Edit";
        (function(id) {
            saveEditBtn.addEventListener("click", function() { saveEditComment(id); });
        })(comment.id);

        editBtnDiv.appendChild(cancelEditBtn);
        editBtnDiv.appendChild(saveEditBtn);
        editContainer.appendChild(editBtnDiv);
        card.appendChild(editContainer);

        // Reply form container
        var replyContainer = document.createElement("div");
        replyContainer.id = "reply-form-container-" + comment.id;
        replyContainer.style.marginTop = "10px";
        replyContainer.style.display = "none";

        var replyTextarea = document.createElement("textarea");
        replyTextarea.className = "form-control";
        replyTextarea.style.fontSize = "0.85rem";
        replyTextarea.style.minHeight = "60px";
        replyTextarea.id = "reply-content-" + comment.id;
        replyTextarea.placeholder = "Type your reply...";
        replyContainer.appendChild(replyTextarea);

        var replyBtnDiv = document.createElement("div");
        replyBtnDiv.style.display = "flex";
        replyBtnDiv.style.justifyContent = "flex-end";
        replyBtnDiv.style.gap = "8px";
        replyBtnDiv.style.marginTop = "8px";

        var cancelReplyBtn = document.createElement("button");
        cancelReplyBtn.className = "btn btn-secondary";
        cancelReplyBtn.style.padding = "4px 8px";
        cancelReplyBtn.style.fontSize = "0.75rem";
        cancelReplyBtn.textContent = "Cancel";
        (function(id) {
            cancelReplyBtn.addEventListener("click", function() { hideReplyForm(id); });
        })(comment.id);

        var submitReplyBtn = document.createElement("button");
        submitReplyBtn.className = "btn btn-primary";
        submitReplyBtn.style.padding = "4px 8px";
        submitReplyBtn.style.fontSize = "0.75rem";
        submitReplyBtn.textContent = "Submit Reply";
        (function(id) {
            submitReplyBtn.addEventListener("click", function() { postReply(id); });
        })(comment.id);

        replyBtnDiv.appendChild(cancelReplyBtn);
        replyBtnDiv.appendChild(submitReplyBtn);
        replyContainer.appendChild(replyBtnDiv);
        card.appendChild(replyContainer);

        // Nested Replies
        if (comment.replies && comment.replies.length > 0) {
            var repliesDiv = document.createElement("div");
            repliesDiv.className = "comment-replies";
            repliesDiv.style.marginLeft = "20px";
            repliesDiv.style.borderLeft = "2px solid #334155";
            repliesDiv.style.paddingLeft = "12px";
            repliesDiv.style.marginTop = "12px";
            comment.replies.forEach(function(reply) {
                repliesDiv.appendChild(buildCommentElement(reply));
            });
            card.appendChild(repliesDiv);
        }

        return card;
    }

    commentsList.forEach(function(c) {
        container.appendChild(buildCommentElement(c));
    });
}

function showReplyForm(commentId) {
    document.getElementById("reply-form-container-" + commentId).style.display = "block";
}
function hideReplyForm(commentId) {
    document.getElementById("reply-form-container-" + commentId).style.display = "none";
}

function showEditCommentForm(commentId, currentText) {
    document.getElementById("edit-comment-container-" + commentId).style.display = "block";
    document.getElementById("edit-comment-content-" + commentId).value = currentText;
}
function hideEditCommentForm(commentId) {
    document.getElementById("edit-comment-container-" + commentId).style.display = "none";
}

async function saveEditComment(commentId) {
    var text = document.getElementById("edit-comment-content-" + commentId).value.trim();
    if (!text) {
        alert("Empty comments cannot be submitted.");
        return;
    }
    try {
        var res = await fetch(API_BASE + "/comments/" + commentId, {
            method: "PUT",
            headers: Auth.getHeaders(),
            body: JSON.stringify({ content: text })
        });
        if (res.ok) {
            loadDecisionDetails();
        } else {
            alert("Could not update comment.");
        }
    } catch (err) {
        alert(err.message);
    }
}

async function deleteComment(commentId) {
    if (confirm("Are you sure you want to delete this comment?")) {
        try {
            var res = await fetch(API_BASE + "/comments/" + commentId, {
                method: "DELETE",
                headers: Auth.getHeaders()
            });
            if (res.ok) {
                loadDecisionDetails();
            } else {
                alert("Could not delete comment.");
            }
        } catch (err) {
            alert(err.message);
        }
    }
}

async function postReply(parentId) {
    var content = document.getElementById("reply-content-" + parentId).value.trim();
    if (!content) {
        alert("Empty comments cannot be submitted.");
        return;
    }

    try {
        var res = await fetch(API_BASE + "/comments", {
            method: "POST",
            headers: Auth.getHeaders(),
            body: JSON.stringify({
                decision_id: DECISION_ID,
                content: content,
                parent_id: parentId
            })
        });

        if (res.ok) {
            loadDecisionDetails();
        } else {
            alert("Could not post reply.");
        }
    } catch (err) {
        console.error(err);
    }
}

// Post root comment
document.getElementById("add-comment-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    var content = document.getElementById("comment-content").value.trim();
    var fileInput = document.getElementById("comment-file");
    var errAlert = document.getElementById("comment-error-alert");
    errAlert.style.display = "none";

    if (!content) {
        errAlert.textContent = "Empty comments cannot be submitted.";
        errAlert.style.display = "block";
        return;
    }

    try {
        var res = await fetch(API_BASE + "/comments", {
            method: "POST",
            headers: Auth.getHeaders(),
            body: JSON.stringify({
                decision_id: DECISION_ID,
                content: content
            })
        });

        if (!res.ok) {
            var errData = await res.json();
            var msg = errData.detail;
            if (Array.isArray(msg)) msg = msg.map(function(m) { return m.msg; }).join(", ");
            throw new Error(msg || "Could not post comment.");
        }

        var comment = await res.json();

        if (fileInput.files.length > 0) {
            var formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("comment_id", comment.id);

            var uploadRes = await fetch(API_BASE + "/decisions/" + DECISION_ID + "/attachments", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + Auth.getToken()
                },
                body: formData
            });
            if (!uploadRes.ok) {
                alert("Comment posted, but file upload failed.");
            }
        }

        document.getElementById("comment-content").value = "";
        fileInput.value = "";
        document.getElementById("file-selected-name").textContent = "";

        loadDecisionDetails();
    } catch (err) {
        errAlert.textContent = err.message;
        errAlert.style.display = "block";
    }
});

async function actionApprovalTask(approvalId, status) {
    var comments = prompt("Enter review comments for " + status + ":", "");
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
            alert("Approval actioned: " + status);
            loadDecisionDetails();
        } else {
            var data = await res.json();
            alert("Failed to action approval: " + data.detail);
        }
    } catch (err) {
        console.error(err);
    }
}

async function submitForReview() {
    if (!confirm("Are you sure you want to submit this decision for review?")) return;

    try {
        var res = await fetch(API_BASE + "/decisions/" + DECISION_ID + "/submit-review", {
            method: "POST",
            headers: Auth.getHeaders()
        });
        if (res.ok) {
            alert("Decision successfully submitted for review.");
            loadDecisionDetails();
        } else {
            var err = await res.json();
            alert("Error submitting for review: " + err.detail);
        }
    } catch (err) {
        console.error(err);
    }
}

async function archiveDecision() {
    if (!confirm("Are you sure you want to archive this decision?")) return;

    try {
        var res = await fetch(API_BASE + "/decisions/" + DECISION_ID + "/archive", {
            method: "POST",
            headers: Auth.getHeaders()
        });
        if (res.ok) {
            alert("Decision archived.");
            loadDecisionDetails();
        } else {
            var err = await res.json();
            alert("Error archiving: " + err.detail);
        }
    } catch (err) {
        console.error(err);
    }
}

window.addEventListener("DOMContentLoaded", function() {
    setTimeout(loadDecisionDetails, 300);
});
