import axios from "axios";

const API = "http://127.0.0.1:8000";

export const getUsers = async () => {
    const res = await axios.get(`${API}/users`);
    return res.data;
};

export const updateRole = async (id, role) => {
    const res = await axios.put(
        `${API}/users/${id}/role`,
        { role }
    );
    return res.data;
};

export const deleteUser = async (id) => {
    const res = await axios.delete(
        `${API}/users/${id}`
    );
    return res.data;
};