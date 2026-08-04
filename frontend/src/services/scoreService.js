import API from "./api";

// Get all scores
export const getScores = () =>
    API.get("/alternative-scores");

// Get scores for one decision
export const getDecisionScores = (decisionId) =>
    API.get(`/decisions/${decisionId}/scores`);

// Create
export const createScore = (data) =>
    API.post("/alternative-scores", data);

// Update
export const updateScore = (scoreId, data) =>
    API.put(`/alternative-scores/${scoreId}`, data);

// Delete
export const deleteScore = (scoreId) =>
    API.delete(`/alternative-scores/${scoreId}`);