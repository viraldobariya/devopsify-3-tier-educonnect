// AppContent.jsx
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { autoLogin } from "./api/authApi";
import { login } from "./store/slices/authSlice";
import AppRouter from "./routes/routes";
import { fetchConnections } from "./services/connectionService";
import socketService from "./services/SocketService";
import { fetchNotifications } from "./store/slices/notificationsSlice";

const AppContent = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const init = async () => {
      try {
        const res = await autoLogin();
        if (res.status === 200){
          await dispatch(fetchConnections());  
          await dispatch(fetchNotifications()); 
          socketService.connect();
          dispatch(login(res.data.user));
        }
        console.log("Auto Login ", res)

      } catch (e) {
        console.error("Auto login failed:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-dots mb-4">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">EduConnect</h2>
        <p className="text-gray-400">Loading your premium experience...</p>
      </div>
    </div>
  );

  return <AppRouter />;
};

export default AppContent;


