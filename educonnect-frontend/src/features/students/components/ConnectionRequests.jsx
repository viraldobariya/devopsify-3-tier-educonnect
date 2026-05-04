import { useEffect, useState } from 'react';
import { acceptConnect, pendingRequest, rejectRequest } from '../../../api/connectAPI';
import { UserCheck, UserX, Users, Clock, Loader2 } from 'lucide-react';

export default function ConnectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonStates, setButtonStates] = useState({});

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await pendingRequest();
        console.log(response.data);
        setRequests(response.data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleRequest = async (id, action) => {
    setButtonStates(prev => ({ 
      ...prev, 
      [id]: { 
        loading: true, 
        action: action.toLowerCase() 
      } 
    }));

    try {
      let res;
      if (action === "ACCEPT") {
        res = await acceptConnect({ id });
      } else {
        res = await rejectRequest({ id });
      }
      
      if (res.status === 200) {
        setRequests(prev => prev.filter(req => req.sender.id !== id));
        setButtonStates(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      } else {
        console.log("Connection request failed to respond.");
        setButtonStates(prev => ({ 
          ...prev, 
          [id]: { loading: false, action: null } 
        }));
      }
    } catch (error) {
      console.error('Failed to process request:', error);
      setButtonStates(prev => ({ 
        ...prev, 
        [id]: { loading: false, action: null } 
      }));
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-40 h-40 bg-gradient-to-tr from-cyan-400/10 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-gradient-to-br from-indigo-500/8 to-purple-500/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Header with enhanced styling */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="relative p-4 bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-cyan-500/20 rounded-2xl border border-purple-400/30 backdrop-blur-sm shadow-lg">
            <Users className="w-6 h-6 text-purple-300" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent"></div>
          </div>
          <div>
            <h3 className="font-bold text-2xl bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-1">
              Connection Requests
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="animate-pulse">Discovering connections...</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {`${requests.length} pending ${requests.length === 1 ? 'request' : 'requests'}`}
                </span>
              )}
            </p>
          </div>
        </div>
        
        {!loading && requests.length > 0 && (
          <div className="relative">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
            <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></div>
          </div>
        )}
      </div>

      {/* Enhanced Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-16 relative z-10">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-12 h-12 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              <div className="absolute inset-4 w-8 h-8 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-slate-300 font-medium animate-pulse">Checking for new requests...</p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        </div>
      ) : requests.length === 0 ? (
        // Enhanced Empty State
        // <div className="flex items-center justify-center py-16 relative z-10">
        //   <div className="text-center space-y-4">
        //     <div className="w-20 h-20 mx-auto bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full flex items-center justify-center border border-slate-600/50">
        //       <Users className="w-8 h-8 text-slate-500" />
        //     </div>
        //     <div className="space-y-2">
        //       <h4 className="text-slate-300 font-semibold text-lg">All caught up!</h4>
        //       <p className="text-slate-500 text-sm">No pending connection requests at the moment.</p>
        //     </div>
        //   </div>
        // </div>
        null
      ) : (
        // Enhanced Requests List
        <div className="space-y-4 relative z-10">
          {requests.map((request, index) => {
            const buttonState = buttonStates[request.sender.id] || {};
            
            return (
              <div
                key={request.sender.id} 
                className={`group relative bg-gradient-to-r from-white/5 via-white/3 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/40 transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:-translate-y-2 hover:scale-[1.02] ${
                  request.removing ? 'animate-pulse opacity-50 scale-95' : 'animate-fadeIn'
                }`}
                style={{ 
                  animationDelay: `${index * 0.15}s`,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)'
                }}
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  {/* Enhanced User Info */}
                  <div className="flex items-center space-x-5">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 blur-sm group-hover:blur-md transition-all duration-500"></div>
                      <img 
                        src={request.sender.avatar} 
                        alt={request.sender.fullName}
                        className="relative w-16 h-16 rounded-2xl border-2 border-white/20 group-hover:border-purple-400/60 transition-all duration-500 object-cover shadow-xl group-hover:shadow-2xl group-hover:shadow-purple-500/30"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-purple-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-slate-900 shadow-lg">
                        <div className="absolute inset-0.5 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-cyan-300 group-hover:bg-clip-text transition-all duration-500 text-lg">
                        {request.sender.fullName}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="font-medium">{request.sender.course}</span>
                        <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                        <span>{request.sender.university}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {request.sender.skills.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 text-xs font-medium rounded-full border border-purple-400/30 backdrop-blur-sm group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                            {skill}
                          </span>
                        ))}
                        {request.sender.skills.length > 2 && (
                          <span className="px-3 py-1.5 bg-slate-700/50 text-slate-300 text-xs font-medium rounded-full border border-slate-600/50 backdrop-blur-sm">
                            +{request.sender.skills.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => handleRequest(request.sender.id, 'ACCEPT')}
                      disabled={buttonState.loading}
                      className="group/btn px-6 py-3 bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 hover:from-green-500 hover:via-green-400 hover:to-emerald-400 text-white text-sm font-semibold rounded-xl border border-green-400/50 hover:border-green-300/70 transition-all duration-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-xl hover:shadow-green-500/40 active:scale-95 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      {buttonState.loading && buttonState.action === 'accept' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => handleRequest(request.sender.id, 'REJECT')}
                      disabled={buttonState.loading}
                      className="group/btn px-6 py-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 hover:from-slate-600 hover:via-slate-500 hover:to-slate-600 text-slate-300 hover:text-white text-sm font-semibold rounded-xl border border-slate-600/50 hover:border-slate-500/70 transition-all duration-500 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:shadow-xl hover:shadow-slate-500/40 active:scale-95 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                      {buttonState.loading && buttonState.action === 'reject' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Declining...</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          <span>Decline</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}