// import React, { useEffect, useState } from 'react';
// import { useSelector , useDispatch } from 'react-redux';
// import BellButton from '../components/BellButton';
// import NotificationDrawer from '../components/NotificationDrawer';
// import ToastHost from '../components/ToastHost';
// import { Link } from 'react-router-dom';
// import FreindSuggestion from "./FreindSuggestion";
// import {fetchNotifications, addNotification} from '../../../store/slices/notificationsSlice';
// import SocketService from '../../../services/SocketService';


// const PrivateHome = () => {
//   let user = useSelector(store => store.auth.user);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
//       {/* Hero Welcome Section */}
//       <div className="bg-gradient-to-b from-yellow-900/10 via-transparent to-transparent py-32 px-6 relative overflow-hidden">
//         {/* Background Elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
//         </div>

//         <div className="max-w-6xl mx-auto text-center relative z-10">
//           <div className="slide-up">
//             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-8 leading-tight">
//               Welcome back,<br />
//               <span className="text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text">
//                 {user?.fullName}
//               </span>
//             </h1>
//             <p className="text-gray-300 text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
//               Ready to connect, learn, and grow with your student community?
//             </p>
            
//             {/* Quick Actions */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
//               <div className="card-glass p-6 text-center hover:scale-105 transition-all duration-300">
//                 <div className="text-yellow-400 text-3xl mb-4">🎓</div>
//                 <h3 className="text-white font-bold text-lg mb-2">Find Students</h3>
//                 <p className="text-gray-400">Connect with peers</p>
//               </div>
//               <div className="card-glass p-6 text-center hover:scale-105 transition-all duration-300">
//                 <div className="text-yellow-400 text-3xl mb-4">📅</div>
//                 <h3 className="text-white font-bold text-lg mb-2">Join Events</h3>
//                 <p className="text-gray-400">Discover opportunities</p>
//               </div>
//               <div className="card-glass p-6 text-center hover:scale-105 transition-all duration-300">
//                 <div className="text-yellow-400 text-3xl mb-4">💬</div>
//                 <h3 className="text-white font-bold text-lg mb-2">Start Chatting</h3>
//                 <p className="text-gray-400">Build relationships</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Friend Suggestions Section */}
//       <div className="py-16">
//         <FreindSuggestion />
//       </div>
//     </div>
//   )
// }

// const UpdatesHero = ({ user }) => (
//   <div className="bg-gradient-to-b from-yellow-900/10 via-transparent to-transparent py-20 px-4 relative overflow-hidden">
//     <div className="max-w-5xl mx-auto text-center relative z-10">
//       <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3">
//         Welcome back, <span className="text-yellow-400">{user?.fullName}</span>
//       </h1>
//       <p className="text-gray-300 max-w-2xl mx-auto">Your updates hub — events, messages, and connection requests in one place.</p>
//     </div>
//   </div>
// );

// const SummaryPanels = () => {
//   const unread = useSelector((s) => s.notifications?.unreadCount || 0);
//   return (
//     <aside className="hidden lg:block w-72 p-4">
//       <div className="bg-gray-800 p-4 rounded-lg space-y-3">
//         <div className="text-xs text-gray-400">Today</div>
//         <div className="text-2xl font-semibold text-white">{unread}</div>
//         <div className="text-sm text-gray-300">unread notifications</div>

//         <div className="mt-4">
//           <div className="text-xs text-gray-400 mb-2">Upcoming events</div>
//           <ul className="space-y-2">
//             <li className="text-sm text-gray-200">No upcoming events — <Link to="/events" className="text-indigo-400">Explore</Link></li>
//           </ul>
//         </div>
//       </div>
//     </aside>
//   );
// };

// const UpdatesListPlaceholder = () => (
//   <div className="space-y-3">
//     {[...Array(6)].map((_, i) => (
//       <div key={i} className="h-20 bg-gray-800 animate-pulse rounded-lg" />
//     ))}
//   </div>
// );

// const UpdatesHub = () => {
//   const user = useSelector((s) => s.auth.user);
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const notificationsState = useSelector((s) => s.notifications);
//   const dispatch = useDispatch();
//   const items = notificationsState.order.map((id) => notificationsState.byId[id]).filter(Boolean);

//   useEffect(() => {
//     dispatch(fetchNotifications());
//   }, [dispatch]);
//   const onNotificationReceived = (notifi) => {
//     dispatch(addNotification(notifi));

//     if ("Notification" in window && Notification.permission === "granted") {
//       new Notification(notifi.title || "New Notification", {
//         body: notifi.message || "",
//         // icon: "/icon-192.png", 
//       });
//     }
//   };

//   useEffect(() => {
//     let subscription;
//     const timeoutId = setTimeout(() => {
//       subscription = SocketService.setOnNotificationCallback(onNotificationReceived);
//     }, 1000);

//     return () => {
//       clearTimeout(timeoutId);
//       if (subscription) subscription();
//     };
//   }, []);

//   useEffect(() => {
//     if ("Notification" in window && Notification.permission !== "granted") {
//       Notification.requestPermission();
//     }
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
//       <ToastHost />
//       <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
//       <header className="sticky top-0 z-40 bg-transparent border-b border-gray-800 backdrop-blur-sm py-3">
//         <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
//           <div>
//             <h2 className="text-xl font-semibold text-white">Updates</h2>
//             <div className="text-xs text-gray-400">All your activity in one place</div>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="hidden sm:block">
//               <input aria-label="Search updates" placeholder="Search updates" className="px-3 py-2 rounded bg-gray-800 text-white text-sm focus:ring-2 focus:ring-purple-500" />
//             </div>
//             <button className="text-sm px-3 py-2 bg-gray-800 rounded text-gray-200">Unread only</button>
//             <BellButton onClick={() => setDrawerOpen(true)} />
//           </div>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
//         <section className="space-y-4">
//           <div className="bg-gray-800 p-4 rounded-lg">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm text-gray-300">Recent</h3>
//               <div className="text-xs text-gray-400">Sorted by priority & time</div>
//             </div>
//           </div>

//           <div className="bg-gray-800 p-4 rounded-lg">
//             {/* {notificationsState.status === 'loading' && <UpdatesListPlaceholder />} */}

//             {notificationsState.status !== 'loading' && items.length === 0 && (
//               <div className="p-8 text-center text-gray-400">
//                 <p className="mb-3">No recent updates</p>
//                 <Link to="/events" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">Explore events</Link>
//               </div>
//             )}

//             {notificationsState.status !== 'loading' && items.length > 0 && (
//               <div className="space-y-3">
//                 {items.map((n) => (
//                   <div key={n.id} className="p-2">
//                     <div className={`p-3 rounded-lg ${n.read ? 'bg-gray-800' : 'bg-gray-700 ring-1 ring-indigo-500/20'}`}>
//                       <div className="flex items-start gap-3">
//                         <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center text-white">
//                           {n.type.split('_')[0][0]}
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-center justify-between gap-3">
//                             <div>
//                               <div className="text-sm text-white font-semibold">{n.title}</div>
//                               {n.message && <div className="text-xs text-gray-300 line-clamp-2">{n.message}</div>}
//                             </div>
//                             <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute:'2-digit' })}</div>
//                           </div>
//                           <div className="mt-2 flex gap-2">
//                             {/* Quick actions: adapt based on notification type */}
//                             {n.type.startsWith('FRIEND') && (
//                               <>
//                                 <button className="px-3 py-1 bg-emerald-600 text-white text-xs rounded">Accept</button>
//                                 <button className="px-3 py-1 bg-rose-600 text-white text-xs rounded">Decline</button>
//                               </>
//                             )}
//                             {n.type.startsWith('EVENT') && (
//                               <>
//                                 <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded">View</button>
//                                 <button className="px-3 py-1 bg-gray-700 text-gray-200 text-xs rounded">RSVP</button>
//                               </>
//                             )}
//                             {n.type.startsWith('CHAT') && (
//                               <>
//                                 <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded">Open</button>
//                                 <button className="px-3 py-1 bg-gray-700 text-gray-200 text-xs rounded">Mute</button>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>

//         <SummaryPanels />
//       </main>
//     </div>
//   );
// };

// export default UpdatesHub;






import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import BellButton from '../components/BellButton';
import NotificationDrawer from '../components/NotificationDrawer';
import ToastHost from '../components/ToastHost';
import FriendSuggestion from "./FreindSuggestion";

const PrivateHome = () => {
  const user = useSelector(store => store.auth.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const connections = useSelector(store => store.connection.connections);
  const notifications = Object.values(useSelector(store => store.notifications.byId));

  useEffect(() => {
    console.log("notifications testing : " );
    console.log(notifications);
  }, [])
  

  // Quick stats data
  const quickStats = [
    { label: 'Connections', value: connections.length, color: 'blue', icon: '👥', link: '/students/connections' },
    { label: 'Upcoming Events', value: notifications.filter(n => n.type === "NEW_EVENT").length, color: 'cyan', icon: '📅', link: '/events' },
    { label: 'Unread Messages', value: notifications.filter(n => n.type === "NEW_MESSAGE").length, color: 'indigo', icon: '💬', link: '/chat' },
  ];

  // Main modules data
  const mainModules = [
    {
      title: 'Students',
      description: 'Connect & Network',
      icon: '🎓',
      color: 'blue',
      links: [
        { name: 'Find Students', path: '/students', icon: '🔍' },
        { name: 'My Connections', path: '/students/connections', icon: '👥' },
        { name: 'Friend Requests', path: '/students', icon: '🤝' }
      ]
    },
    {
      title: 'Events',
      description: 'Learn & Grow',
      icon: '📅',
      color: 'cyan',
      links: [
        { name: 'Upcoming Events', path: '/events', icon: '🎯' },
        { name: 'My Registered', path: '/events/my-registrations', icon: '📋' },
        { name: 'Create Event', path: '/events', icon: '✨' }
      ]
    },
    {
      title: 'QConnect',
      description: 'Ask & Answer',
      icon: '💡',
      color: 'emerald',
      links: [
        { name: 'Browse Questions', path: '/qconnect', icon: '📚' },
        { name: 'Ask Question', path: '/qconnect/post', icon: '✍️' },
        { name: 'My Questions', path: '/qconnect/myquestion', icon: '📝' }
      ]
    },
    {
      title: 'Chat',
      description: 'Communicate',
      icon: '💭',
      color: 'indigo',
      links: [
        { name: 'Chatting', path: '/chat', icon: '💬' },
        { name: 'Personal Chat', path: '/chat/personal', icon: '👤' },
        { name: 'Group Chat', path: '/chat/groups', icon: '👥' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20">
      <ToastHost />
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      {/* Main Content */}
      <div className="relative">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Bell */}
          <div className="flex justify-end mb-8">
            <BellButton onClick={() => setDrawerOpen(true)} />
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
              <span className="text-2xl">👋</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome back,{' '}
              <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">
                {user?.fullName}
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Your student networking hub is ready. Connect, learn, and grow together.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {quickStats.map((stat, index) => (
              <Link
                key={index}
                to={stat.link}
                className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/60 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                    <p className="text-white text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 bg-${stat.color}-600/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Main Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            {mainModules.map((module, index) => (
              <div
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all duration-300 group"
              >
                {/* Module Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${module.color}-600 to-${module.color}-400 rounded-xl flex items-center justify-center shadow-lg`}>
                    <span className="text-xl">{module.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{module.title}</h3>
                    <p className="text-gray-400 text-sm">{module.description}</p>
                  </div>
                </div>

                {/* Module Links */}
                <div className="space-y-2">
                  {module.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      to={link.path}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 group/link"
                    >
                      <span className="text-gray-400 group-hover/link:text-gray-300 text-lg">{link.icon}</span>
                      <span className="text-gray-300 group-hover/link:text-white text-sm font-medium">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Preview */}
          <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              {/* <Link to="/activity" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View all
              </Link> */}
            </div>
            
            <div className="space-y-3">
              {[
                { type: 'message', text: 'New message from Alex Chen', time: '2 min ago', icon: '💬' },
                { type: 'event', text: 'Web Development Workshop starting soon', time: '1 hour ago', icon: '📅' },
                { type: 'question', text: 'Your question got 3 new answers', time: '3 hours ago', icon: '💡' },
                { type: 'connection', text: 'Sarah Johnson accepted your request', time: '5 hours ago', icon: '👥' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors duration-200">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.text}</p>
                    <p className="text-gray-400 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friend Suggestions */}
          <div className="mt-12">
            <FriendSuggestion />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateHome;