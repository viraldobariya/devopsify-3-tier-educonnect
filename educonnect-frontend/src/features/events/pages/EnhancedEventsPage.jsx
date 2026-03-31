import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Calendar, Users, Plus, X, CalendarDays, Sparkles, MapPin, Star, TrendingUp } from 'lucide-react';
import EnhancedEventList from '../components/EnhancedEventList';
import CreateEventModal from '../components/CreateEventModal';
import { setSearchQuery, setFilterType } from '../../../store/slices/eventsSlice';

const EnhancedEventsPage = () => {
  const dispatch = useDispatch();
  const { searchQuery, filterType } = useSelector(state => state.events);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Debounce timeout ref
  const searchTimeoutRef = useRef(null);

  // Sync local search query with Redux state on mount
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleEventCreated = () => {
    setShowCreateModal(false);
  };

  const handleSearchChange = useCallback((value) => {
    setLocalSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setSearchQuery(value));
    }, 500); // Reduced delay to 500ms for better UX
  }, [dispatch]);

  const handleFilterChange = (value) => {
    dispatch(setFilterType(value));
  };

  const clearFilters = () => {
    // Clear timeout if active
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    setLocalSearchQuery('');
    dispatch(setSearchQuery(''));
    dispatch(setFilterType('upcoming'));
    setDateRange({ startDate: '', endDate: '' });
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = () => {
    if (dateRange.startDate && dateRange.endDate) {
      dispatch(setFilterType('date-range'));
    }
  };

  const filterOptions = [
    { value: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-4 h-4" /> },
    { value: 'all', label: 'All Events', icon: <Sparkles className="w-4 h-4" /> },
    { value: 'past', label: 'Past Events', icon: <CalendarDays className="w-4 h-4" /> },
    { value: 'popular', label: 'Popular', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'my-created', label: 'My Events', icon: <Users className="w-4 h-4" /> }
  ];

  const activeFiltersCount = (searchQuery ? 1 : 0) + 
                           (filterType !== 'upcoming' ? 1 : 0) + 
                           (dateRange.startDate && dateRange.endDate ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl px-6 py-4 border border-purple-500/30 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Discover Events
                </h1>
                <p className="text-gray-400 mt-1">Find amazing educational events near you</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link
              to="/events/my-registrations"
              className="group flex items-center gap-3 px-6 py-3 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 text-white rounded-xl transition-all duration-300 border border-gray-700/30 hover:border-gray-600/50 hover:shadow-lg"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">My Registrations</span>
            </Link>
            
            <button
              onClick={handleCreateEvent}
              className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-90 transition-transform">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Create Event</span>
            </button>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 shadow-2xl">
          {/* Main Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events by title, description, or location..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-gray-700/70 transition-all duration-300 border border-gray-600/30 hover:border-gray-500/50"
            />
            {localSearchQuery && (
              <button 
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${
                    filterType === option.value
                      ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-purple-500/50 shadow-lg'
                      : 'bg-gray-700/30 text-gray-300 border-gray-600/30 hover:bg-gray-700/50 hover:border-gray-500/50'
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${
                showAdvancedSearch 
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-purple-500/50'
                  : 'bg-gray-700/30 text-gray-300 border-gray-600/30 hover:bg-gray-700/50'
              } ${activeFiltersCount > 0 ? 'animate-pulse' : ''}`}
            >
              <Filter className={`w-4 h-4 transition-transform duration-300 ${showAdvancedSearch ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">
                {showAdvancedSearch ? 'Hide Filters' : 'Advanced Filters'}
              </span>
              {activeFiltersCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Search Panel */}
          <div className={`mt-6 transition-all duration-500 overflow-hidden ${
            showAdvancedSearch ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-gray-700/30 rounded-xl p-6 space-y-6 border border-gray-600/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Filter className="w-4 h-4 text-white" />
                  </div>
                  Advanced Filters
                </h3>
                <button
                  onClick={() => setShowAdvancedSearch(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" />
                  Filter by Date Range
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-400 text-sm font-medium">From Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-gray-600/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-500/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-400 text-sm font-medium">To Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-gray-600/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-gray-500/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-400 text-sm font-medium opacity-0">Apply</label>
                    <button
                      onClick={applyDateFilter}
                      disabled={!dateRange.startDate || !dateRange.endDate}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-300 font-medium"
                    >
                      Apply Date Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Section */}
              {activeFiltersCount > 0 && (
                <div className="border-t border-gray-600/30 pt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-gray-400 font-medium">Active filters:</span>
                    
                    {searchQuery && (
                      <div className="flex items-center bg-purple-600/20 text-purple-300 px-3 py-2 rounded-full text-sm border border-purple-500/30">
                        <Search className="w-3 h-3 mr-1" />
                        <span>{searchQuery}</span>
                        <button 
                          onClick={() => handleSearchChange('')}
                          className="ml-2 text-purple-400 hover:text-purple-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {filterType !== 'upcoming' && filterType !== 'date-range' && (
                      <div className="flex items-center bg-blue-600/20 text-blue-300 px-3 py-2 rounded-full text-sm border border-blue-500/30">
                        <Sparkles className="w-3 h-3 mr-1" />
                        <span>{filterOptions.find(f => f.value === filterType)?.label}</span>
                        <button 
                          onClick={() => handleFilterChange('upcoming')}
                          className="ml-2 text-blue-400 hover:text-blue-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {(dateRange.startDate && dateRange.endDate) && (
                      <div className="flex items-center bg-green-600/20 text-green-300 px-3 py-2 rounded-full text-sm border border-green-500/30">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        <span>{dateRange.startDate} to {dateRange.endDate}</span>
                        <button 
                          onClick={() => {
                            setDateRange({ startDate: '', endDate: '' });
                            dispatch(setFilterType('all'));
                          }}
                          className="ml-2 text-green-400 hover:text-green-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-full text-sm border border-red-500/30 hover:border-red-400/50 transition-all"
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Event List */}
        <EnhancedEventList 
          searchQuery={searchQuery}
          filterType={filterType}
          dateRange={dateRange}
          showPagination={true}
          limit={9}
        />

        {/* Create Event Modal */}
        {showCreateModal && (
          <CreateEventModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onEventCreated={handleEventCreated}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedEventsPage;