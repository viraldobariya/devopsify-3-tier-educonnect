// components/MessageList.jsx
import { useEffect, useRef } from 'react';
import { File } from 'lucide-react';

const MessageList = ({messages}) => {
  
  const messagesEndRef = useRef(null);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  // return (
  //   <div className="h-[70vh] overflow-y-auto p-4 space-y-4">
  //     {
  //       messages.map((message, index) => (
  //       <div key={index} className="flex items-start gap-3">
  //         <div className="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
  //           {message.sender.fullName.charAt(0)}
  //         </div>
  //         <div className="flex-1">
  //           <div className="flex items-center gap-2">
  //             <span className="font-medium">{message.sender.fullName}</span>
  //             <span className="text-gray-400 text-xs">
  //               {message.timestamp}
  //             </span>
  //           </div>
  //           {message.mediaType === 'TEXT' ? (
  //             <p className="mt-1 text-gray-300">{message.content}</p>
  //           ) : (
  //             <a 
  //               href={message.fileUrl} 
  //               className="mt-1 inline-flex items-center text-blue-400 hover:text-blue-300"
  //             >
  //               <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  //               </svg>
  //               {message.fileName}
  //             </a>
  //           )}
  //         </div>
  //       </div>
  //     ))}
  //     <div ref={messagesEndRef} />
  //   </div>
  // );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
      {messages.map((message, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="bg-gray-800 rounded-xl w-12 h-12 flex items-center justify-center text-lg">
            {message.sender.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-medium text-gray-200">{message.sender.fullName}</span>
              <span className="text-gray-500d text-xs">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {message.mediaType === 'TEXT' ? (
              <p className="text-gray-300 bg-gray-800 p-3 rounded-xl rounded-tl-none inline-block">{message.content}</p>
            ) : (
              <a 
                href={message.fileUrl} 
                className="mt-1 inline-flex items-center text-blue-400 hover:text-blue-300 bg-gray-800 p-3 rounded-xl rounded-tl-none transition-colors"
              >
                <File className="w-5 h-5 mr-2" />
                {message.fileName}
              </a>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;