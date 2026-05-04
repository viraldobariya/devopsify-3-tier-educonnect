import { useState } from 'react';
import { Link } from 'react-router-dom';
import StudentSearch from '../components/StudentSearch';
import StudentFilters from '../components/StudentFilters';
import ConnectionsList from '../components/SearchList';
import ConnectionRequests from '../components/ConnectionRequests';

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    university: "all",
    course: "all",
    skills: [],
  });

  return (
    <div className="bg-gray-900 min-h-screen p-6 overflow-x-hidden">
      {/* Header with Connections Button */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Connect with Students</h1>
          <p className="text-gray-400">Find and network with peers</p>
        </div>
        <Link 
          to="/students/connections" 
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
          </svg>
          My Connections
        </Link>
      </div>

      {/* Rest of the code remains the same */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* <div className="col-span-1"> */}
          <ConnectionRequests />
        {/* </div> */}
        <div className="col-span-3">
          <StudentSearch 
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <StudentFilters 
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>
      </div>
      <ConnectionsList 
        searchQuery={searchQuery}
        filters={filters}
      />
    </div>
  );
}