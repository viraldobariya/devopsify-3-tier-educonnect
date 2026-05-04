import { getConnections } from "../api/connectAPI";
import { setConnections } from "../store/slices/connectionSlice";


export const fetchConnections = () => async (dispatch) => {

  const res = await getConnections();
  if (res.status !== 200) throw new Error("error while fetching connections.");
  console.log(res.data);
  dispatch(setConnections(res.data));
}