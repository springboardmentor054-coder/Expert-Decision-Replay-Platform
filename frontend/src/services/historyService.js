import API from "./api";

// ======================================
// Get All Versions
// ======================================

export const getDecisionVersions = (decisionId) =>
    API.get(`/decisions/${decisionId}/versions`);

// ======================================
// Get Specific Version
// ======================================

export const getVersion = (
    decisionId,
    versionNumber
) =>
    API.get(
        `/decisions/${decisionId}/versions/${versionNumber}`
    );

// ======================================
// Create Version
// ======================================

export const createVersion = (
    decisionId,
    data
) =>
    API.post(
        `/decisions/${decisionId}/versions`,
        data
    );