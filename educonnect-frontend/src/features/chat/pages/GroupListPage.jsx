import { useEffect, useState } from 'react';
import GroupList from '../components/GroupList';
import CreateGroupModal from '../components/CreateGroupModal';
import SearchBar from '../components/SearchBar';
import { getInvites, respondToInvite } from '../../../api/chatApi';
import { myGroups, searchGroup } from '../../../api/chatApi';
import { useSelector } from 'react-redux';
import { Plus, Bell, Check, X , ArrowLeft} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GroupListPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupInvites, setGroupInvites] = useState([]);
  const currentUser = useSelector(store => store.auth.user);
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();
  const [loading , setLoading] = useState(false);
  // ensure spinner shows immediately while GroupList performs its fetch
  // useEffect(() => {
    // setLoading(true);
  //   // GroupList will clear loading when its fetch completes
  // }, []);
  
  useEffect(() => {
    const fetchInvites = async () => {
      try {
        setLoading(true);
        const res = await getInvites(currentUser);
        if (res.status === 200) {
          setGroupInvites(res.data);
          console.log("group invites", res.data);
        } else {
          console.log("Error while fetching invites.");
        }
      } catch (e) {
        console.log("Error while fetching invites.", e);
      }
      setLoading(false);
    };
    fetchInvites();
  }, [currentUser]);

  // fetch groups (debounced) and control loading here
  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetch = async () => {
      try {
        let res;
        if (!searchTerm || searchTerm.trim() === '') {
          res = await myGroups();
        } else {
          res = await searchGroup(searchTerm.trim());
        }

        if (!active) return;

        if (res && res.status === 200) {
          setGroups(res.data);
        } else {
          setGroups([]);
        }
      } catch (e) {
        console.log('Error fetching groups', e);
        setGroups([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const id = setTimeout(fetch, 500);

    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [searchTerm, currentUser]);

  const handleRespondToInvite = async (groupName, accept) => {
    try {
      const res = await respondToInvite({groupName, sender:currentUser, accept});
      if (res.status === 200) {
        // Remove the handled invite from the list
        setGroupInvites(prev => prev.filter(invite => invite.groupName !== groupName));
      } else {
        console.log("Error responding to invite");
      }
    } catch (e) {
      console.log("Error responding to invite", e);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-5">
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
          className="text-blue-400 hover:text-blue-300 flex items-center transition-colors"
          onClick={() => navigate('/chat')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Chat Gateway
        </button>
          <h1 className="text-2xl font-bold">Group Chats</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl flex items-center transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Group
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-2/3">
            <SearchBar 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="Search groups..."
            />
          </div>
        </div>

        {/* Group Invites Section */}
        {groupInvites.length > 0 && (
          <div className="mb-8 bg-gray-800 rounded-xl p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold">Group Invitations</h2>
            </div>
            <div className="space-y-3">
              {groupInvites.map((invite, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-750 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-900 flex items-center justify-center">
                      <span className="text-lg">{invite.groupName.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{invite.groupName}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToInvite(invite.groupName, true)}
                      className="px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-xl text-sm transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToInvite(invite.groupName, false)}
                      className="px-3 py-1.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        
        <GroupList groups={groups} loading={loading} />
        
        {showCreateModal && (
          <CreateGroupModal setGroups={setGroups} onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    </div>
  );
};

export default GroupListPage;