// components/MessageInput.jsx
import { useRef, useState } from 'react';
// import { PaperClipIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import {getFileUrl, sendGroupMessage} from '../../../api/chatApi';
import SocketService from '../../../services/SocketService';
import { Loader2, Paperclip, PaperclipIcon, Send } from 'lucide-react';
import { PaperClipOutlined } from '@ant-design/icons';
import { BiPaperPlane } from 'react-icons/bi';

const MessageInput = ({ group, currentUser, setMessages }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try{
      const tempMessage = {};

      tempMessage.name = group.name;
      tempMessage.sender = currentUser;
      tempMessage.timestamp = new Date().toISOString();

      if (file){
        const res = await getFileUrl(file);
        if (res.status !== 200){
          console.log("error while sending message.", res.statusText);
          return;
        }
        tempMessage.mediaType = "FILE";
        tempMessage.fileUrl = res.data;
        tempMessage.fileName = message;
        tempMessage.content = "";
      }
      else{
        tempMessage.mediaType = "TEXT";
        tempMessage.fileUrl = "";
        tempMessage.fileName = "";
        tempMessage.content = message;
      }

      console.log('message ', tempMessage);

      const res = await sendGroupMessage(tempMessage);
      if (res.status !== 200){
        console.log("error while storing message.");
        return;
      }
      console.log(res.data);
      SocketService.sendGroupMessage(tempMessage);
      setMessages(prev => [...prev, res.data]);
      setFile(null);
      setMessage("");
      if (fileInputRef.current){
        fileInputRef.current.value = null;
      }

    }
    catch(e){
      console.log("error while sending message.", e);
    }
    finally{
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(selectedFile.name);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="w-full bg-gray-700 rounded-lg py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="absolute right-3 top-2.5 cursor-pointer">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          {/* <PaperClipIcon className="w-5 h-5 text-gray-400 hover:text-white" /> */}
          <PaperclipIcon />
        </label>
      </div>
      <button
        type="submit"
        disabled={(!message && !file) || loading}
        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg p-2"
      >
        {loading ? <Loader2 /> : <BiPaperPlane className="w-5 h-5" />}
      </button>
    </form>
  );
  // return (
  //   <form onSubmit={handleSubmit} className="flex gap-3">
  //     <div className="flex-1 relative">
  //       <input
  //         type="text"
  //         value={message}
  //         onChange={(e) => setMessage(e.target.value)}
  //         placeholder="Type a message..."
  //         className="w-full bg-gray-800 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700 text-white"
  //       />
  //       <label className="absolute right-3 top-3 cursor-pointer">
  //         <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
  //         <Paperclip className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
  //       </label>
  //     </div>
  //     <button
  //       type="submit"
  //       disabled={(!message && !file) || loading}
  //       className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl p-3 transition-colors"
  //     >
  //       {loading ? 
  //         <Loader2 className="animate-spin h-5 w-5 text-white" /> : 
  //         <Send className="w-5 h-5 text-white" />
  //       }
  //     </button>
  //   </form>
  // );
};

export default MessageInput;