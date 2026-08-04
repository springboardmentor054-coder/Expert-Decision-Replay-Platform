import API from "./api";

// Get all criteria
export const getCriteria = () =>
    API.get("/criteria");

// Get one criterion
export const getCriterion = (id) =>
    API.get(`/criteria/${id}`);

// Create
export const createCriterion = (data) =>
    API.post("/criteria", data);

// Update
export const updateCriterion = (id, data) =>
    API.put(`/criteria/${id}`, data);

// Delete
export const deleteCriterion = (id) =>
    API.delete(`/criteria/${id}`);