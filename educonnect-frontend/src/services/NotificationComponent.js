// In your component
import { useEffect } from 'react';
import SocketService from './SocketService';

const NotificationComponent = () => {
  useEffect(() => {
    // Set up notification callback
    SocketService.setOnNotificationCallback((notification) => {
      console.log("New notification received:", notification);
      // Dispatch to Redux store or update state
    });

    // Connect to WebSocket
    SocketService.connect().catch(error => {
      console.error("Failed to connect to WebSocket:", error);
    });

    // Cleanup on component unmount
    return () => {
      SocketService.disconnect();
    };
  }, []);

  // return (
  //   // Your component JSX
  // );
};

export default NotificationComponent;