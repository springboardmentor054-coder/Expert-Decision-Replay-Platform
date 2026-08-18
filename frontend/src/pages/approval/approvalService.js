import API from "./api";

// Get all approvals
export const getApprovals = () => {
    return API.get("/approvals");
};

// Get one approval with full details
export const getApprovalDetails = (approvalId) => {
    return API.get(`/approvals/${approvalId}`);
};

// Approve
export const approveDecision = (approvalId, reviewerId) => {
    return API.put(
        `/approvals/${approvalId}/approve?reviewer_id=${reviewerId}`
    );
};

// Reject
export const rejectDecision = (
    approvalId,
    reviewerId,
    remarks
) => {
    return API.put(
        `/approvals/${approvalId}/reject`,
        { remarks },
        {
            params: {
                reviewer_id: reviewerId
            }
        }
    );
};