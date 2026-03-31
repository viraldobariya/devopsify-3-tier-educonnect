import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createGroup } from "../../../api/chatApi";
import { X, Loader } from "lucide-react";

// CreateGroupModal.jsx
const CreateGroupModal = ({ onClose, setGroups }) => {
  const [form, setForm] = useState({
    name: "",
    isPrivate: false,
    notifies: []
  })
  const connections = useSelector(store => store.connection.connections);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({...form, [e.target.name]:e.target.value});
  }

  const handleNotifiesToggle = (notify) => {
    const newNotifies = form.notifies.includes(notify) ?
      form.notifies.filter(item => item !== notify) :
      [...form.notifies, notify];
      setForm({...form, notifies:newNotifies});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(form)
    if (form.name === ""){
      setErrorMessage("empty name");
      return;
    }

    setLoading(true);

    try{
      const res = await createGroup(form);
      if (res.status === 200){
        console.log(res.data);
        setGroups(prev => [...prev, res.data])
        onClose();
      }
      else{
        console.log("error while creating group.", res);
        setErrorMessage(res.statusText);
      }
    }
    catch(e){
      console.log("error while creating group.", e);
      setErrorMessage("Something wrong happened.");
    }
    finally{
      setLoading(false);
    }

  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create New Group</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X/>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-300 mb-3 font-medium">Group Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => handleChange(e)}
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none border border-gray-700"
              required
            />
          </div>
          
          <div className="mb-5 flex items-center bg-gray-800 p-3 rounded-xl">
            <input
              type="checkbox"
              id="private"
              name="isPrivate"
              checked={form.isPrivate}
              onChange={(e) => {
                setForm(prev => {return {...prev, isPrivate: e.target.checked}});
              }}
              className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
            />
            <label htmlFor="private" className="ml-3 text-gray-300 font-medium">
              Private Group
            </label>
          </div>
          
          <div className="mb-6">
            <div className="space-y-3">
              <p className="font-semibold text-gray-300">Invite Connections</p>
              <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 max-h-52 overflow-y-auto custom-scrollbar">
                {connections.map(connection => (
                  <div 
                    key={connection.id} 
                    className="flex items-center gap-3 py-2 px-3 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.notifies.includes(connection)}
                      onChange={() => handleNotifiesToggle(connection)}
                      className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600"
                    />
                    <span className="text-gray-200">{connection.fullName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {errorMessage && <div className="text-red-400 mb-4 text-center">{errorMessage}</div>}
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-colors font-medium disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  Creating...
                </span>
              ) : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;


