import apiClient from "./apiClient";


export const sendConnect = async (data) => {
  const res = await apiClient.post("/connection/send", data);
  return res;
}

export const getStatus = async () => {
  const res = await apiClient.get("/connection/status");
  return res;
} 

export const acceptConnect = async (data) => {
  const res = await apiClient.post("/connection/accept", data);
  return res;
}

export const pendingRequest = async () => {
  const res = await apiClient.get("/connection/pending");
  return res;
}

export const rejectRequest = async (data) => {
  const res = await apiClient.post("/connection/reject", data);
  return res;
}


export const getConnections = async () => {
  const res = await apiClient.get("/connection/connections");
  console.log(res.data);
  return res;
}