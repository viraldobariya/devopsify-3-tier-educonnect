import apiClient from "./apiClient";


export const sendOTP = async (data) => {
  const res = await apiClient.post('/mail/otp', data)
  return res;
}