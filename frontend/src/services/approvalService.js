import API from "./api";

// ======================================
// Get All Approvals
// ======================================

export const getApprovals = () =>
    API.get("/approvals");

// ======================================
// Get Approval By ID
// ======================================

export const getApproval = (id) =>
    API.get(`/approvals/${id}`);

// ======================================
// Create Approval
// ======================================

export const createApproval = (data) =>
    API.post("/approvals", data);

// ======================================
// Update Approval
// ======================================

export const updateApproval = (id, data) =>
    API.put(`/approvals/${id}`, data);

// ======================================
// Delete Approval
// ======================================

export const deleteApproval = (id) =>
    API.delete(`/approvals/${id}`);

// ======================================
// Get Decision Approvals
// ======================================

export const getDecisionApprovals = (
    decisionId
) =>
    API.get(
        `/decisions/${decisionId}/approvals`
    );

// ======================================
// Approve
// ======================================

export const approveDecision = (
    approvalId,
    reviewerId
) =>
    API.put(
        `/approvals/${approvalId}/approve`,
        null,
        {
            params: {
                reviewer_id: reviewerId
            }
        }
    );

// ======================================
// Reject
// ======================================

export const rejectDecision = (
    approvalId,
    reviewerId,
    remarks
) =>
    API.put(
        `/approvals/${approvalId}/reject`,
        null,
        {
            params: {
                reviewer_id: reviewerId,
                remarks
            }
        }
    );

export const getApprovalDetails = (approvalId) =>
    API.get(`/approvals/${approvalId}/details`);

// ======================================
// Get Approval History
// ======================================

export const getApprovalHistory = () =>
    API.get("/approvals/history");