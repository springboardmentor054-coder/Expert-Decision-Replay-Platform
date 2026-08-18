import axios from "axios";

const API = "http://127.0.0.1:8000";

const getAuditLogs = async () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const response = await axios.get(`${API}/audit-logs`, {
    params: {
      user_id: user.user_id,
    },
  });

  return response.data;
};

export default getAuditLogs;