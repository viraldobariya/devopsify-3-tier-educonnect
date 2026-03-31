import { login, logout } from "../api/authApi"
import {login as loginSlice, logout as logoutSlice} from '../store/slices/authSlice'
import {fetchConnections} from "./connectionService";
import socketService from "./SocketService";
import {clearConnections} from '../store/slices/connectionSlice';

export const loginService = (data) => async (dispatch) => {

  const res = await login(data);
  if (res.status !== 200){
    throw new Error("error while login.");
  }
  dispatch(loginSlice(res.data.user));
  localStorage.setItem("accessToken", res.data.accessToken);
  dispatch(fetchConnections());
  socketService.connect();
  return res;
}

export const logoutService = () => async (dispatch) => {
  localStorage.removeItem("accessToken");
  await logout();
  dispatch(logoutSlice());
  dispatch(clearConnections());
  socketService.disconnect();
}

