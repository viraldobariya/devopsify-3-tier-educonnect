import { BiLowVision } from "react-icons/bi";
import apiClient from "./apiClient"


export const getSuggestion = async () => {
  const res = await apiClient.get("/user/suggest");
  return res;
}

export const update = async (user, avatar) => {
  let formData = new FormData();
  formData.set("user", new Blob([JSON.stringify(user)], {type: 'application/json'}))
  if (avatar !== null && typeof avatar !== 'string'){
    formData.set("avatar", avatar);
  }

  const res = apiClient.post('/user/update', formData, {
    // 'Content-Type': 'multipart/form-data'
  });

  return res;
}

export const getProfile = async (username) => {
  const res = await apiClient.get(`/user/find?username=` + username);
  return res;
}

export const checkUpdate = async (data) => {
  const res = await apiClient.post('/user/check-update-availability', data);
  return res;
}


export const searchUser = async (data) => {
  const res = await apiClient.post("/user/search", data);
  return res;
}

export const searchByUsername = async (search) => {
  const res = await apiClient.get("/user/search-by-username?search="+search);
  return res;
}

export const chatUsers = async () => {
  const res = await apiClient.get("/user/chat-users");
  return res;
}