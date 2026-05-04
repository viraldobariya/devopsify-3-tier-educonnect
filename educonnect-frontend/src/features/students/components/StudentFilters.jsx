import { Universities, Courses, Skills } from "../../../constants/enums";
import { Filter, University, BookOpen, Code, ChevronDown, X, Search, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function StudentFilters({ filters, onFilterChange }) {
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.skills-dropdown-container')) {
        setSkillsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillToggle = (skill) => {
    const updatedSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    
    onFilterChange({ ...filters, skills: updatedSkills });
  };

  const clearAllFilters = () => {
    onFilterChange({
      university: 'all',
      course: 'all',
      skills: []
    });
    setSkillsDropdownOpen(false);
  };

  const hasActiveFilters = filters.university !== 'all' || filters.course !== 'all' || filters.skills.length > 0;

  return (
    <div className={`card-glass p-8 mb-8 relative overflow-visible transition-all duration-700 ${isAnimated ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-royal-blue/6 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gold/4 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-gold/20 to-gold/10 rounded-xl border border-gold/30 shadow-lg shadow-gold/10">
            <Filter className="w-6 h-6 text-gold" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-display font-bold text-white text-xl">
                Filter Students
              </h3>
              <Sparkles className="w-4 h-4 text-gold animate-pulse" />
            </div>
            <p className="text-gray-400 text-base font-body">
              Discover your perfect study companions and collaborators
            </p>
          </div>
        </div>
        
        {hasActiveFilters && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gold/10 rounded-lg border border-gold/20">
              <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
              <span className="text-gold font-body font-medium text-sm">
                {[filters.university !== 'all', filters.course !== 'all', filters.skills.length > 0].filter(Boolean).length} active
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-body font-semibold text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/60 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <X className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* University Filter */}
        <div className="space-y-4 group">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gold/10 rounded-lg group-hover:bg-gold/20 transition-colors duration-300">
              <University className="w-5 h-5 text-gold" />
            </div>
            <label className="block text-base font-body font-semibold text-white group-hover:text-gold transition-colors duration-300">
              University
            </label>
          </div>
          <div className="relative">
            <select
              value={filters.university}
              onChange={(e) => onFilterChange({...filters, university: e.target.value})}
              className="w-full appearance-none bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 hover:border-gold/50 focus:border-gold focus:ring-2 focus:ring-gold/20 rounded-xl px-4 py-4 pr-12 text-white font-body text-base cursor-pointer transition-all duration-300 shadow-lg hover:shadow-gold/10"
            >
              <option value="all" className="bg-gray-800 text-white">🎓 All Universities</option>
              {Universities.map((uni) => (
                <option key={uni} value={uni} className="bg-gray-800 text-white">{uni}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Course Filter */}
        <div className="space-y-4 group">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-royal-blue/10 rounded-lg group-hover:bg-royal-blue/20 transition-colors duration-300">
              <BookOpen className="w-5 h-5 text-royal-blue" />
            </div>
            <label className="block text-base font-body font-semibold text-white group-hover:text-royal-blue transition-colors duration-300">
              Course
            </label>
          </div>
          <div className="relative">
            <select
              value={filters.course}
              onChange={(e) => onFilterChange({...filters, course: e.target.value})}
              className="w-full appearance-none bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 hover:border-royal-blue/50 focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/20 rounded-xl px-4 py-4 pr-12 text-white font-body text-base cursor-pointer transition-all duration-300 shadow-lg hover:shadow-royal-blue/10"
            >
              <option value="all" className="bg-gray-800 text-white">📚 All Courses</option>
              {Courses.map((course) => (
                <option key={course} value={course} className="bg-gray-800 text-white">{course}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-royal-blue transition-colors duration-300" />
            </div>
          </div>
        </div>

        {/* Skills Filter */}
        <div className="space-y-4 group relative">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors duration-300">
              <Code className="w-5 h-5 text-green-400" />
            </div>
            <label className="block text-base font-body font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
              Skills
            </label>
          </div>
          <div className="relative skills-dropdown-container">
            <button
              onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
              className="w-full bg-gray-800/60 backdrop-blur-sm border-2 border-gray-700/50 hover:border-green-400/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 rounded-xl px-4 py-4 pr-12 text-left font-body text-base cursor-pointer transition-all duration-300 shadow-lg hover:shadow-green-400/10 focus:outline-none"
            >
              <span className={filters.skills.length > 0 ? 'text-white' : 'text-gray-400'}>
                {filters.skills.length > 0 
                  ? `🚀 ${filters.skills.length} skill${filters.skills.length > 1 ? 's' : ''} selected`
                  : '💻 Select skills...'
                }
              </span>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-green-400 transition-all duration-300 ${skillsDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {skillsDropdownOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                  onClick={() => setSkillsDropdownOpen(false)}
                ></div>
                
                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700/60 rounded-2xl shadow-2xl shadow-black/50 z-[60] max-h-80 overflow-hidden animate-slide-up">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-700/50 bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 font-body font-semibold text-sm">Select Skills</span>
                      <button
                        onClick={() => setSkillsDropdownOpen(false)}
                        className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Skills List */}
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    <div className="z-50 p-2">
                      {Skills.map((skill, index) => (
                        <label
                          key={skill}
                          className="flex items-center space-x-3 px-3 py-3 hover:bg-gray-700/50 cursor-pointer transition-all duration-200 rounded-xl group/item"
                          style={{ animationDelay: `${index * 0.02}s` }}
                        >
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={filters.skills.includes(skill)}
                              onChange={() => handleSkillToggle(skill)}
                              className="w-5 h-5 text-green-400 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-green-400 focus:ring-2 transition-all duration-200 cursor-pointer"
                            />
                            {filters.skills.includes(skill) && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          <span className="text-white text-sm font-body group-hover/item:text-green-400 transition-colors duration-200 flex-1">
                            {skill}
                          </span>
                          {filters.skills.includes(skill) && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-700/50 bg-gray-800/50">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{filters.skills.length} selected</span>
                      <button
                        onClick={() => onFilterChange({ ...filters, skills: [] })}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selected Skills Display */}
      {filters.skills.length > 0 && (
        <div className="mt-8 relative z-50 animate-fade-in">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-green-400" />
            <h4 className="text-base font-body font-semibold text-green-400">Selected Skills</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {filters.skills.map((skill, index) => (
              <span
                key={skill}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-400/10 text-green-400 text-sm font-body font-medium rounded-full border border-green-400/40 hover:border-green-400/60 transition-all duration-300 hover:scale-105 animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span>💡 {skill}</span>
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="hover:bg-green-400/20 rounded-full p-1 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-8 pt-6 border-t border-gradient-to-r from-transparent via-gray-700/50 to-transparent relative z-10 animate-fade-in">
          <div className="flex items-center justify-between bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold/10 rounded-lg">
                <Filter className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-body font-medium text-white">Active Filters</p>
                <p className="text-xs font-body text-gray-400 mt-1">
                  {[
                    filters.university !== 'all' ? `🎓 ${filters.university}` : null,
                    filters.course !== 'all' ? `📚 ${filters.course}` : null,
                    filters.skills.length > 0 ? `💻 ${filters.skills.length} skills` : null
                  ].filter(Boolean).join(' • ')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-gold/10 rounded-lg border border-gold/20">
              <Sparkles className="w-3 h-3 text-gold animate-pulse" />
              <span className="text-gold font-body font-medium text-xs">Filtering</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}