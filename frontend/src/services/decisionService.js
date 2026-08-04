import API from "./api";

// ==========================
// Get all decisions
// ==========================

export const getDecisions = () =>
    API.get("/decisions");

// ==========================
// Get single decision
// ==========================

export const getDecision = (id) =>
    API.get(`/decisions/${id}`);

// ==========================
// Create decision
// ==========================

export const createDecision = (data) =>
    API.post("/decisions", data);

// ==========================
// Update decision
// ==========================

export const updateDecision = (id, data) =>
    API.put(`/decisions/${id}`, data);

// ==========================
// Delete decision
// ==========================

export const deleteDecision = (id) =>
    API.delete(`/decisions/${id}`);

// ==========================
// Submit decision for approval
// ==========================

export const submitDecision = (decisionId) =>
    API.put(`/decisions/${decisionId}/submit`);