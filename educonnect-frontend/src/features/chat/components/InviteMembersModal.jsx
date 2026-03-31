import { useState } from "react";
import { useSelector } from "react-redux";
import { bulkGroupInvites } from "../../../api/chatApi";
import { X } from "lucide-react";

// InviteMembersModal.jsx
const InviteMembersModal = ({ group, onClose }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const connections = useSelector(store => store.connection.connections);
  const currentUser = useSelector(store => store.auth.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      // filter out users who are already members or admin
      const alreadyMemberSet = new Set([
        ...(group.members || []).map(m => m.username),
        group.admin?.username,
      ].filter(Boolean));

      const toInvite = selectedUsers.filter(u => !alreadyMemberSet.has(u));

      if (toInvite.length === 0) {
        console.log('No new users to invite.');
      } else {
        const res = await bulkGroupInvites({groupName: group.name, usernames: toInvite});
        if (res.status !== 200){
          console.log("error while inviting.");
        }
        else{
          setSelectedUsers([]);
        }
      }
    }catch (e){
      console.log("error while inviting.", e);
    }
    onClose();
  };

  const handleToggle = (connection) => {
    const username = connection.username;
    // prevent toggling if already a member
    const isMember = (group.admin?.username === username) || (group.members || []).some(m => m.username === username);
    if (isMember) return;

    if (selectedUsers.includes(username)){
      setSelectedUsers(selectedUsers.filter(user => user !== username));
    }
    else{
      setSelectedUsers([...selectedUsers, username]);
    }
  }

  // return (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //     <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
  //       <div className="flex justify-between items-center mb-4">
  //         <h2 className="text-xl font-bold">Invite Members</h2>
  //         <button onClick={onClose} className="text-gray-400 hover:text-white">
  //           &times;
  //         </button>
  //       </div>
        
  //       <form onSubmit={handleSubmit}>
  //         <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
  //               {connections.map(connection => (
  //                 <label key={connection.id} className="flex items-center gap-2">
  //                   <input
  //                     type="checkbox"
  //                     checked={selectedUsers.includes(connection.username)}
  //                     onChange={() => handleToggle(connection.username)}
  //                   />
  //                   {connection.fullName}
  //                 </label>
  //               ))}
  //             </div>
          
  //         <div className="flex justify-end">
  //           <button
  //             type="button"
  //             onClick={onClose}
  //             className="mr-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
  //           >
  //             Cancel
  //           </button>
  //           <button
  //             type="submit"
  //             className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
  //           >
  //             Send Invites
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Invite to {group.name}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 mb-3 font-medium">Select Connections</label>
            <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 max-h-52 overflow-y-auto custom-scrollbar">
              {connections.map(connection => {
                const username = connection.username;
                const isMember = (group.admin?.username === username) || (group.members || []).some(m => m.username === username);
                const disabled = isMember || (group.isPrivate && currentUser?.id !== group.admin?.id);
                return (
                <div 
                  key={connection.id} 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-700'}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(connection.username)}
                    onChange={() => handleToggle(connection)}
                    disabled={disabled}
                    className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <span className="text-gray-200">{connection.fullName}</span>
                    {isMember && <span className="ml-2 text-xs text-gray-400">• Member</span>}
                    {(!isMember && group.isPrivate && currentUser?.id !== group.admin?.id) && <span className="ml-2 text-xs text-amber-400">• Only admin can invite</span>}
                  </div>
                </div>
                )
              })}
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors font-medium"
            >
              Send Invites
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMembersModal;