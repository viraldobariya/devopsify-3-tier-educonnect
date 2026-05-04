import { acceptConnect, sendConnect } from '../../../api/connectAPI';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function StudentCard({ student, status }) {

  const currentUser = useSelector(store => store.auth.user);
  const navigate = useNavigate();


  let sendConnectionRequest = async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = "Loading..."
      try{
        const res = await sendConnect({id : btn.id});
        if (res.status === 200){
          btn.innerHTML = "PENDING";
        }
        else{
          console.log("Error while connecting.");
          btn.innerHTML = "CONNECT";
        }
      }
      catch(e){
        console.log("Error while connection", e);
        btn.innerHTML = "CONNECT";
      }
      finally{
        btn.disabled = false;
      }
    }

    const acceptConncetionRequest = async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.innerHTML = "Loading..."
        try{
          const res = await acceptConnect({id : btn.id});
          if (res.status === 200){
            btn.innerHTML = "CONNECTED";
          }
          else{
            console.log("Error while connecting.");
            btn.innerHTML = "ACCEPT";
          }
        }
        catch(e){
          console.log("Error while connection", e);
          btn.innerHTML = "ACCEPT";
        }
        finally{
          btn.disabled = false;
        }
      }

  return (
    <div key={student.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex items-start gap-4">
        <img 
          onClick = {() => navigate("/profile?username=" + student.username)}
          src={student.avatar || '/default-avatar.png'} 
          alt={student.fullName}
          className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
        />
        <div className="flex-1">
          <h3 className="font-medium text-white">{student.fullName}</h3>
          <p className="text-gray-400 text-sm">{student.university} • {student.course}</p>
          
          <div className="mt-2 flex flex-wrap gap-2">
            {student.skills?.slice(0, 3).map(skill => (
              <span key={skill} className="bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-center">
        {student.id === currentUser.id ? <button className = "border border-gray-300 rounded-xl p-2 md:p-3">Yourself</button> : (status === "NEVER" ? 
        <>
          <button id={student.id} onClick = {sendConnectionRequest} className = "border border-gray-300 rounded-xl p-2 md:p-3">CONNECT</button>
        </>
        :
        (status === "ACCEPT" ? 
          <>
            <button id={student.id} onClick = {acceptConncetionRequest} className = "border border-gray-300 rounded-xl p-2 md:p-3">ACCEPT</button>
          </>
          :
          <>
            <button id={student.id} className = "border border-gray-300 rounded-xl p-2 md:p-3 cursor-not-allowed">{status}</button>
          </>
        ))}
        {/* <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm flex items-center justify-center gap-1">
           Message
        </button> */}
      </div>
    </div>
  );
}


