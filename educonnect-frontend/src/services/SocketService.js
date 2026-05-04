import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class SocketService{
  socket = null;
  notificationSubscription = null;
  onNotificationCallback = null;

  connect() {
    console.log("Trying to activate socket.");

    if (this.socket && this.socket.active) {
      this.socket.deactivate();
    }

    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    this.socket = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_BACKEND_URL + "/ws?token=" + accessToken),
      connectHeaders: {
        "Authorization": "Bearer " + accessToken,
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log("Websocket connected.", frame);

        // Subscribe once connected
        this.subscribeToNotifications();
      },
      onStompError: (frame) => {
        console.log("Websocket error while connecting.", frame);
      }
    });

    this.socket.activate();
  }

  disconnect() {
    console.log("Trying to deactivate socket.");
    if (this.socket && this.socket.active) {
      console.log("Deactivating socket.");
      this.socket.deactivate();
    }
  }

  subscribeToNotifications() {
    if (!this.socket || !this.socket.active) {
      console.log("Cannot subscribe to notifications - socket not connected.");
      return;
    }

    // Unsubscribe if already subscribed
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    this.notificationSubscription = this.socket.subscribe(
      "/user/queue/notifications",
      (message) => {
        console.log("Received notification:", message.body);

        if (this.onNotificationCallback) {
          try {
            this.onNotificationCallback(JSON.parse(message.body));
          } catch (e) {
            console.error("Failed to parse notification:", e);
          }
        }
      }
    );

    console.log("Subscribed to notifications");
  }

  setOnNotificationCallback(callback) {
    this.onNotificationCallback = callback;

    // If socket already connected, subscribe immediately
    if (this.socket && this.socket.active) {
      this.subscribeToNotifications();
    }
  }

  subscribePrivate(onMessageReceived){
    if (!this.socket || !this.socket.active){
      console.log("subscribing before stompclient is connected.");
      return null;
    }

    return this.socket.subscribe("/user/queue/message", onMessageReceived);
  }

  // subscribeToNotifications() {
  //   console.log("sjdbfhdsbhsdfh dfhdsfsd");
  //   if (!this.socket || !this.socket.active) {
  //     console.log("Cannot subscribe to notifications - socket not connected.");
  //     return;
  //   }

  //   // Unsubscribe from previous notifications if any
  //   if (this.notificationSubscription) {
  //     this.notificationSubscription.unsubscribe();
  //   }

  //   // Subscribe to notifications
  //   this.notificationSubscription = this.socket.subscribe(
  //     "/user/queue/notifications",
  //     (message) => {
  //       console.log("Received notification:", message);
  //       // Handle the notification here
  //       // You might want to dispatch to Redux or call a callback
  //       if (this.onNotificationCallback) {
  //         this.onNotificationCallback(JSON.parse(message.body));
  //       }
  //     }
  //   );

  //   console.log("Subscribed to notifications");
  // }


  // setOnNotificationCallback(callback) {
  //   this.onNotificationCallback = callback;
    
  //   // If already connected, subscribe immediately
  //   // if (this) {
  //     this.subscribeToNotifications();
  //   // }
  // }


  sendPrivateMessage(data){
    if (!this.socket || !this.socket.active){
      console.log("sending before stompclient is connected.");
      return null;
    }

    this.socket.publish({
      destination: "/app/private-chat", 
      body: JSON.stringify(data)});
  }

  sendGroupMessage(data){
    if (!this.socket || !this.socket.active){
      console.log("sending before stompclient is connected.");
      return null;
    }

    console.log("publishing message", data);
    this.socket.publish({
      destination: "/app/group-chat",
      body: JSON.stringify(data)
    });
  }

  subscribeGroupMessage(groupName, onMessageReceived){
    if (!this.socket || !this.socket.active){
      console.log("subscribing before stompclient is connected.");
      return null;
    }

    return this.socket.subscribe("/topic/group/"+groupName, onMessageReceived);
  }

  getSocket(){
    return this.socket;
  }
}

export default new SocketService();