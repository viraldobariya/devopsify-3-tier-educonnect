import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Users, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import eventApi from '../../../api/eventApi';

const EventRegistrationsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (eventId) {
      loadEventAndRegistrations();
    }
  }, [eventId, currentPage, searchQuery, filterType]);

  const loadEventAndRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load event details
      const eventResponse = await eventApi.getEventById(eventId);
      setEvent(eventResponse.data);
      
      // Load registrations with new API structure
      const registrationsResponse = await eventApi.getEventRegistrations(eventId);
      const registrationData = registrationsResponse.data;
      
      // Handle the new API response structure
      if (registrationData && registrationData.registrations) {
        setRegistrations(registrationData.registrations);
        setTotalPages(Math.ceil(registrationData.registrations.length / 20) || 1);
      } else {
        setRegistrations([]);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    // Create CSV headers based on new data structure
    const headers = ['Full Name', 'Email', 'User ID', 'Avatar URL'];

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    registrations.forEach(registration => {
      const row = [
        `"${registration.userFullName || 'N/A'}"`,
        `"${registration.userEmail || 'N/A'}"`,
        `"${registration.userId || 'N/A'}"`,
        `"${registration.avtarUrl || 'N/A'}"`
      ];
      
      csvRows.push(row.join(','));
    });

    // Download CSV
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event?.title || 'Event'}_registrations.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRegistrations = registrations.filter(registration => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      registration.userFullName?.toLowerCase().includes(searchLower) ||
      registration.userEmail?.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading registrations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{event?.title}</h1>
            <p className="text-gray-400">Event Registrations</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Registrations</p>
                <p className="text-2xl font-bold text-white">{registrations.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Spots</p>
                <p className="text-2xl font-bold text-white">
                  {event && event.maxParticipants ? Math.max(0, event.maxParticipants - registrations.length) : '∞'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Capacity Filled</p>
                <p className="text-2xl font-bold text-white">
                  {event && event.maxParticipants ? Math.round((registrations.length / event.maxParticipants) * 100) : 0}%
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Event Date</p>
                <p className="text-lg font-bold text-white">
                  {event ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              {/* Registration Count */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {filteredRegistrations.length} of {registrations.length} registrations
                </span>
              </div>
            </div>
            
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={registrations.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {filteredRegistrations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {registrations.length === 0 ? 'No registrations yet' : 'No registrations match your search'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Contact & ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRegistrations.map((registration, index) => (
                    <tr key={registration.userId} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center">
                            {registration.avtarUrl ? (
                              <img
                                src={registration.avtarUrl}
                                alt={registration.userFullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full bg-purple-600 flex items-center justify-center text-white font-medium">
                                      ${registration.userFullName.charAt(0).toUpperCase()}
                                    </div>
                                  `;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white font-medium">
                                {registration.userFullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {registration.userFullName}
                            </div>
                            <div className="text-sm text-gray-400">
                              Registration #{index + 1}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a 
                              href={`mailto:${registration.userEmail}`}
                              className="hover:text-blue-400 transition-colors"
                            >
                              {registration.userEmail}
                            </a>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            ID: {registration.userId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Registered
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`mailto:${registration.userEmail}`, '_blank')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 bg-gray-800 text-white rounded-lg">
                {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrationsPage;