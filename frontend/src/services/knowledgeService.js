import axios from "axios";

const API = "http://127.0.0.1:8000";

// ======================================
// Get Knowledge Repository
// ======================================

export const getKnowledgeRepository = async () => {

  const response = await axios.get(
    `${API}/knowledge`
  );

  return response.data;
};

// ======================================
// Get Single Knowledge Decision
// ======================================

export const getKnowledgeDecision = async (decisionId) => {

  const response = await axios.get(
    `${API}/knowledge/${decisionId}`
  );

  return response.data;
};