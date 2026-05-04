import { File, Loader, Search, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatUsers, searchByUsername } from '../../../api/userApi';
import { useSelector } from 'react-redux';
import { getChat, getFileUrl, sendPrivateMessage } from '../../../api/chatApi';
import socketService from '../../../services/SocketService';



const PersonalChatPage = () => {

  const currentUser = useSelector(store => store.auth.user);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [activeChat, setActiveChat] = useState(null);
  const activeRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const chatRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    activeRef.current = activeChat;
  }, [activeChat])

  const handleSendMessage = async () => {
    if ((!message.trim() && !file) || isSending || !activeChat) return;
    
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('receiverUname', activeChat);
      formData.append("senderUname", currentUser.username);
      formData.append("timestamp", new Date().toISOString());
      
      if (file) {
        const fileUrl = await getFileUrl(file);
        if (fileUrl.status !== 200) return;
        formData.append('fileUrl', fileUrl.data);
        formData.append("fileName", message)
        formData.append("content", "");
        formData.append("mediaType", "FILE");
      } else {
        formData.append("mediaType", "TEXT");
        formData.append('fileUrl', "");
        formData.append("fileName", "")
        formData.append('content', message);
      }

      const res = await sendPrivateMessage(Object.fromEntries(formData.entries()));
      if (res.status === 200) {
        setMessages(prev => [...prev, res.data]);
        socketService.sendPrivateMessage(Object.fromEntries(formData.entries()));
        setMessage("");
        setFile(null);
      } else {
        console.log("Error sending message", res.statusText);
      }
    } catch (e) {
      console.log("Error sending message", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(selectedFile.name); // Show file name in input
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const onMessageReceived = (res) => {
    let tmp = JSON.parse(res.body);
    console.log(tmp, tmp.sender.username, activeRef.current);
    tmp.type = tmp.mediaType;
    if (tmp.sender.username === activeRef.current) {
      setMessages(prev => [...prev, tmp]);
    }
  };

  useEffect(() => {
    let subscription;

    const timeoutId = setTimeout(() => {
      subscription = socketService.subscribePrivate(onMessageReceived);
    }, 1000);

    return () => {
      clearTimeout(timeoutId); // cleanup the timeout in case component unmounts before 500ms
      if (subscription) {
        subscription.unsubscribe(); // safely unsubscribe if it exists
      }
    };
  }, []);


  useEffect(() => {
    if (!activeChat) return;
    const fun = async () => {
      try {
        const res = await getChat(activeChat);
        if (res.status === 200) {
          setMessages(res.data);
        } else {
          console.log("error while fetching messages.", res.statusText);
        }
      } catch (e) {
        console.log("error while fetching messages.", e);
      }
    };
    fun();
  }, [activeChat]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const getChatUsers = async () => {
    setSearchLoading(true);
    try {
      const res = await chatUsers();
      if (res.status === 200) {
        setUsers(res.data);
      } else {
        console.log("Error while fetching chat users.");
      }
    } catch (e) {
      console.log("Error while fetching chat users.", e);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    getChatUsers();
  }, []);

  const onSearch = async () => {
    setSearchLoading(true);
    try {
      const res = await searchByUsername(search.trim());
      if (res.status === 200) {
        setUsers(res.data);
      } else {
        console.log("search by username has some issues", res.statusText);
      }
    } catch (e) {
      console.log("Search by username has some issues.", e);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[89vh] bg-gray-900">
      <header className="bg-gray-800 py-4 px-6 flex justify-between items-center border-b border-gray-700">
        <button 
          className="text-blue-400 hover:text-blue-300 flex items-center transition-colors"
          onClick={() => navigate('/chat')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Chat Gateway
        </button>
        <h2 className="text-xl font-semibold">Personal Chat</h2>
        <div className="w-8"></div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-gray-800 text-gray-200 border-r border-gray-700 overflow-y-auto">
          <div className="p-4 border-b border-gray-700 flex gap-3 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-750 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
            <button 
              onClick={onSearch}
              className="bg-gray-700 p-2.5 rounded-xl hover:bg-gray-600 transition-colors"
            >
              {searchLoading ? 
                <Loader className="w-5 h-5 animate-spin" /> : 
                <Search className="w-5 h-5" />
              }
            </button>
          </div>

          <ul className="divide-y divide-gray-700">
            {users.map((contact) => (
              <li
                key={contact.id}
                className={`p-4 hover:bg-gray-750 cursor-pointer flex items-center transition-colors ${
                  activeChat === contact.username ? 'bg-gray-750' : ''
                }`}
                onClick={() => setActiveChat(contact.username)}
              >
                <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-3">
                  {contact.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{contact.fullName}</p>
                  <p className="text-sm text-gray-400 truncate">@{contact.username}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-850">
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-700 flex items-center bg-gray-800">
                <div className="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-3">
                  {users.find(c => c.username === activeChat)?.fullName.charAt(0)}
                </div>
                <h3 className="font-semibold text-white">
                  {users.find(c => c.username === activeChat)?.fullName}
                </h3>
              </div>

              <div 
                className="flex-1 p-4 overflow-y-auto custom-scrollbar"
                ref={chatRef}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 max-w-xs lg:max-w-md ${
                      msg.sender.username === currentUser.username ? 'ml-auto' : 'mr-auto'
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl ${
                        msg.sender.username === currentUser.username
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-br-none'
                          : 'bg-gray-800 text-gray-200 rounded-bl-none'
                      }`}
                    >
                      {msg.type === 'TEXT' ? (
                        <span>{msg.content}</span>
                      ) : (
                        <a
                          href={msg.fileUrl}
                          download={msg.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <File className="mr-2 flex-shrink-0" />
                          <span className="underline break-all">{msg.fileName}</span>
                        </a>
                      )}
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${
                      msg.sender.username === currentUser.username ? 'text-right' : ''
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-700 flex items-center bg-gray-800">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="*"
                />
                <button
                  onClick={triggerFileInput}
                  className="mr-3 bg-gray-700 text-gray-400 rounded-xl w-12 h-12 flex items-center justify-center hover:bg-gray-600 hover:text-white transition-colors"
                >
                  <File className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={file ? file.name : "Type a message..."}
                  className="text-white flex-1 px-4 py-3 rounded-xl bg-gray-750 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || (!message.trim() && !file)}
                  className="ml-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl w-12 h-12 flex items-center justify-center hover:from-blue-500 hover:to-indigo-600 transition-all disabled:opacity-70"
                >
                  {isSending ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageCircle className="w-20 h-20 mb-5 text-gray-700" strokeWidth={1} />
              <h3 className="text-xl font-medium mb-2 text-gray-400">No chat selected</h3>
              <p className="text-gray-600">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalChatPage;