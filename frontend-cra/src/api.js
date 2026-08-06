import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000"
});


API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =======================
// Authentication APIs
// =======================

export const loginUser = (data) =>
  API.post("/auth/login", data);


export const registerUser = (data) =>
  API.post("/auth/register", data);


// =======================
// Decision APIs
// =======================

export const getDecisions = () =>
  API.get("/decisions/");


export const getDecisionById = (id) =>
  API.get(`/decisions/${id}`);


export const createDecision = (data) =>
  API.post("/decisions/", data);


export const updateDecision = (id, data) =>
  API.put(`/decisions/${id}`, data);


export const deleteDecision = (id) =>
  API.delete(`/decisions/${id}`);


// =======================
// Alternative APIs
// =======================

export const getAlternatives = () =>
  API.get("/alternatives/");


export const getAlternativesByDecision = (decisionId) =>
  API.get(`/decisions/${decisionId}/alternatives`);


export const createAlternative = (data) =>
  API.post("/alternatives/", data);


export const updateAlternative = (id, data) =>
  API.put(`/alternatives/${id}`, data);


export const deleteAlternative = (id) =>
  API.delete(`/alternatives/${id}`);


// =======================
// Document APIs
// =======================

export const getDocuments = () =>
  API.get("/documents/");


export const uploadDocument = (data) =>
  API.post("/documents/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });


export const deleteDocument = (id) =>
  API.delete(`/documents/${id}`);


// =======================
// Comment APIs
// =======================

export const getComments = () =>
  API.get("/comments/");


export const getCommentById = (id) =>
  API.get(`/comments/${id}`);


export const createComment = (data) =>
  API.post("/comments/", data);


export const updateComment = (id, data) =>
  API.put(`/comments/${id}`, data);


export const deleteComment = (id) =>
  API.delete(`/comments/${id}`);


export default API;