import API from "./api";

export const getDashboardStats = () =>
    API.get("/dashboard/stats");

export const getDashboardCharts = () =>
    API.get("/dashboard/charts");

export const getLatestRecommendation = () =>
    API.get("/dashboard/latest-recommendation");

export const getDashboardActivity = () =>
    API.get("/dashboard/activity");