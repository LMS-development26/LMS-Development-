import axios from "axios";

const API = "http://localhost:5000/api/auth";

export const login = async (email: string, password: string) => {
  return axios.post(`${API}/login`, {
    email,
    password,
  });
};