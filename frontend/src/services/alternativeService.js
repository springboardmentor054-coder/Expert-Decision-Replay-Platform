import API from "./api";

// Get all alternatives
export const getAlternatives = () =>
  API.get("/alternatives");

// Get alternatives by decision
export const getDecisionAlternatives = (decisionId) =>
  API.get(`/decisions/${decisionId}/alternatives`);

// Create
export const createAlternative = (data) =>
  API.post("/alternatives", data);

// Update
export const updateAlternative = (id, data) =>
  API.put(`/alternatives/${id}`, data);

// Delete
export const deleteAlternative = (id) =>
  API.delete(`/alternatives/${id}`);