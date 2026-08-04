import API from "./api";

export const getRecommendation = (decisionId) =>
    API.get(`/decisions/${decisionId}/recommendation`);