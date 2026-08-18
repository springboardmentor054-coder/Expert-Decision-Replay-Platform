import axios from "axios";

const API = "http://127.0.0.1:8000";


// ======================================
// Get Dashboard Report
// ======================================

export const getDashboardReport = async () => {

  const response = await axios.get(
    `${API}/reports/dashboard`
  );

  return response.data;

};


// ======================================
// Get Complete Decision Report
// ======================================

export const getDecisionReportData = async (
  decisionId
) => {

  const response = await axios.get(
    `${API}/reports/decision/${decisionId}`
  );

  return response.data;

};