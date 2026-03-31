// GroupChatPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import GroupInfo from '../components/GroupInfo';
import InviteMembersModal from '../components/InviteMembersModal';
import { getGroup, getMessages, isValidGroup, joinGroup, joinRequest, leaveGroup } from '../../../api/chatApi';
import { useSelector } from 'react-redux';
import socketService from '../../../services/SocketService';
import { Lock, Users, Info, Loader, ArrowLeft, Search } from 'lucide-react';

const GroupChatPage = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const [group, setGroup] = useState({
    name: "",
    members: [],
    admin: {id: "", fullName: ""},
    isPrivate: false
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector(store => store.auth.user);
  const [isMember, setIsMember] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 0)
  }, [messages])

  const onGroupLeave = async () => {
    try{
      const res = await leaveGroup({groupName: group.name, username: currentUser.username})
      if (res.status === 200){
        setGroup(prev => {return {...prev, members: prev.members.filter(member => member.username !== currentUser.username)}});
        navigate("/chat/groups");
      }
      else{
        console.log("error while leaving group");
      }
    }
    catch(e){
      console.log("error while leaving group", e);
    }
  }

  const onMessageReceived = (res) => {
    const mes = JSON.parse(res.body);
    console.log(mes);
    if (mes.sender.id !== currentUser.id){
      setMessages(prev => [...prev, mes]);
    }

  }

  useEffect(() => {
    let subscription;
    const timeoutId = setTimeout(() => {
     subscription = socketService.subscribeGroupMessage(name, onMessageReceived);
    }, 1000)

    return (() => {
      clearTimeout(timeoutId);
      if (subscription){
        subscription.unsubscribe();
      }
    })
  }, [name])

  const joinPublicGroup = async () => {
    try{
      const res = await joinGroup({username: currentUser.username, groupName: name});
      if (res.status === 200){
        setGroup(prev => {return {...prev, members: [...prev.members, currentUser]}});
        setIsMember(true);
      }
      else{
        console.log("error while joining group.");
      }
    }
    catch(e){
      console.log('error while joining group.', e);
    }
  }

  useEffect(() => {
    setIsMember(false);
    const fetchGroupData = async () => {
      setLoading(true);
      try {
        const res = await isValidGroup(name);
        if (res.status !== 200 || !res.data) {
          navigate("/unauthorized");
          return;
        }

        const groupRes = await getGroup(name);
        if (groupRes.status === 200) {
          console.log("group", groupRes.data)
          if (groupRes.data.admin.id === currentUser.id || groupRes.data.members.map(member => member.id === currentUser.id).reduce((acc, cur) => acc + cur, 0)) setIsMember(true);
          console.log("this is ", groupRes.data.private);
          setIsPrivate(groupRes.data.isPrivate);
          setGroup(groupRes.data);
        } else {
          console.log("error while getting group.");
        }

        const messageRes = await getMessages(name);
        if (messageRes.status === 200) {
          console.log("messages", messageRes.data);
          setMessages(messageRes.data);
        } else {
          console.log("error while fetching messages.");
        }
      } catch (e) {
        console.log("Unexpected error:", e);
        navigate("/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [name]);

  const sendJoinRequest = async () => {
    try{
      const res = await joinRequest({groupName: group.name, username: currentUser.username});
      if (res !== 200){
        console.log("error while sending join request.");
      }
      navigate("/chat/groups")
    }
    catch(e){
      console.log("error while sending join request.", e);
    }
  }


  if (loading){
    return (
      <div className="h-screen flex justify-center items-center bg-gray-900">
        <Loader className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    )
  }

  if (!isMember){
    if (isPrivate){
      return (
        <div className="h-screen w-screen flex justify-center items-center bg-gray-900">
          <button onClick={sendJoinRequest} className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium text-xl flex items-center transition-transform hover:scale-105">
            <Lock className="w-6 h-6 mr-2" />
            Request To Join Group
          </button>
        </div>
      )
    }
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-gray-900">
        <button onClick={joinPublicGroup} className="p-5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium text-xl flex items-center transition-transform hover:scale-105">
          <Users className="w-6 h-6 mr-2" />
          Join Public Group
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[89vh] bg-gray-900 text-white">
      <header className="bg-gray-800 py-4 px-6 flex justify-between items-center border-b border-gray-700">
        <button 
          className="text-blue-400 hover:text-blue-300 flex items-center transition-colors"
          onClick={() => navigate('/chat/groups')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Groups
        </button>

        <h2 className="text-xl font-semibold">{group.name ? `Group: ${group.name}` : 'Group Chat'}</h2>

        <div className="flex items-center gap-3">
          {(
            (!group.isPrivate && isMember) ||
            (group.isPrivate && currentUser && group.admin && currentUser.id === group.admin.id)
          ) && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
            >
              Invite
            </button>
          )}
          <button 
            onClick={() => setShowGroupInfo(!showGroupInfo)}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
          >
            <Info className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Members sidebar */}
        <aside className="w-72 bg-gray-800 text-gray-200 border-r border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700 flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search members..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-750 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
            <button className="bg-gray-700 p-2.5 rounded-xl hover:bg-gray-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <ul className="divide-y divide-gray-700">
            {group.members.map((member) => (
              <li key={member.id} className={`p-4 hover:bg-gray-750 flex items-center transition-colors`}>
                <div className="bg-indigo-600 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-3">
                  {member.fullName ? member.fullName.charAt(0) : member.username?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{member.fullName || member.username}</p>
                  <p className="text-sm text-gray-400 truncate">@{member.username}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-850">
          <div className="p-4 border-b border-gray-700 flex items-center bg-gray-800">
            <div className="bg-indigo-900 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white">{group.name}</h3>
          </div>

          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <MessageList messages={messages} />
            <div ref={scrollRef} />
          </div>

          <div className="p-4 border-t border-gray-700 flex items-center bg-gray-800">
            <div className="flex-1">
              {/* Keep MessageInput component (logic unchanged) */}
              <MessageInput group={group} currentUser={currentUser} setMessages={setMessages} />
            </div>
          </div>
        </main>

        {/* Right info drawer (kept for parity with existing logic) */}
        {showGroupInfo && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <GroupInfo 
              currentUser={currentUser}
              setGroup={setGroup}
              group={group}
              onInviteClick={() => setShowInviteModal(true)}
              onClose={() => setShowGroupInfo(false)}
              onGroupLeave={onGroupLeave}
            />
          </div>
        )}

        {showInviteModal && (
          <InviteMembersModal 
            group={group}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default GroupChatPage;