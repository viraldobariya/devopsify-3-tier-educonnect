// import {Client} from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// // Append token as query param
// let stompClient = null;

// export const connectSocket = () => {
//   console.log("trying to activate socket.");
//   if (stompClient && stompClient.active){
//     stompClient.deactivate();
//   }

//   let accessToken = localStorage.getItem("accessToken");

//   if (!accessToken) return;

//   stompClient = new Client({
//     webSocketFactory: () => new SockJS(import.meta.env.VITE_BACKEND_URL + "/ws?token=" + accessToken),
//     connectHeaders: {
//       "Authorization" : "Bearer " + accessToken,
//     },
//     debug: (str) => {
//       console.log(str);
//     },
//     reconnectDelay: 5000,
//     onConnect: (frame) => {
//       console.log("Websocket connected.", frame);
//     },
//     onStompError: (frame) => {
//       console.log("Websocket error while connecting.", frame);
//     }
//   });

//   stompClient.activate();


// } 

// export const disconnectSocket = () => {
//   console.log("trying to deactivate socket.");
//   if (stompClient && stompClient.active){
//     console.log("deactivating socket.");
//     stompClient.deactivate();
//   }
// }

// export const subscribePrivate = (onMessageReceived) => {
//   if (!stompClient || !stompClient.active){
//     console.log("subscribing before stompclient is connected.");
//     return null;
//   }

//   return stompClient.subscribe("/user/queue/message", onMessageReceived);

// }

// export const sendPrivateSocketMessage = (data) => {
//   if (!stompClient || !stompClient.active){
//     console.log("sending before stompclient is connected.");
//     return null;
//   }

//   stompClient.publish({
//     destination: "/app/private-chat", 
//     body: JSON.stringify(data)});
// }


// export {stompClient}