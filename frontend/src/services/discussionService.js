import API from "./api";

// ======================================
// Get All Discussions
// ======================================

export const getDiscussions = () =>
    API.get("/discussions");

// ======================================
// Get Discussions By Decision
// ======================================

export const getDecisionDiscussions = (decisionId) =>
    API.get(`/decisions/${decisionId}/discussions`);

// ======================================
// Create Discussion
// ======================================

export const createDiscussion = (data) =>
    API.post("/discussions", data);

// ======================================
// Update Discussion
// ======================================

export const updateDiscussion = (discussionId, data) =>
    API.put(`/discussions/${discussionId}`, data);

// ======================================
// Delete Discussion
// ======================================

export const deleteDiscussion = (discussionId) =>
    API.delete(`/discussions/${discussionId}`);