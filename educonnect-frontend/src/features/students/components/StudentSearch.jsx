import { Search, X, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function StudentSearch({ value, onChange, resultsCount = null, isLoading = false }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const inputRef = useRef(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
    setHasInteracted(true);
  };



  const handleFocus = () => {
    setIsFocused(true);
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };



  return (
    <div className="relative mb-6 lg:mb-8">
      {/* Main Search Container */}
      <div className="relative">
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
          isFocused 
            ? 'bg-gradient-to-r from-purple-500/10 via-blue-500/5 to-purple-500/10 blur-xl scale-110' 
            : 'bg-transparent'
        }`}></div>
        
        {/* Search Input Container */}
        <div className={`relative group transition-all duration-300 ${
          isFocused ? 'scale-[1.02]' : 'scale-100'
        }`}>
          {/* Search Icon */}
          <div className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 z-10">
            <div className={`transition-all duration-300 ${
              isFocused ? 'scale-110' : 'scale-100'
            }`}>
              <Search className={`w-5 h-5 transition-all duration-300 ${
                isFocused ? 'text-purple-400' : 'text-gray-400'
              }`} />
            </div>
          </div>
          
          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students by name, university, skills..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-5 text-sm sm:text-base font-medium bg-gray-800/90 backdrop-blur-sm border rounded-xl sm:rounded-2xl transition-all duration-300 focus:outline-none focus:ring-0 ${
              isFocused
                ? 'border-purple-500/60 shadow-2xl shadow-purple-500/20 bg-gray-800/95'
                : 'border-gray-600/50 shadow-xl hover:border-gray-500/60 hover:shadow-2xl hover:bg-gray-800/95'
            } placeholder:text-gray-500 text-white`}
          />
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-12 sm:right-14 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Clear Button */}
          {value && !isLoading && (
            <button
              onClick={handleClear}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-700/70 hover:bg-gray-600 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 group/clear"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover/clear:rotate-90" />
            </button>
          )}
          
          {/* Enhanced Focus Ring */}
          <div className={`absolute inset-0 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 pointer-events-none ${
            isFocused 
              ? 'border-purple-400/40 shadow-lg shadow-purple-400/25' 
              : 'border-transparent'
          }`}></div>
        </div>
      </div>
      
      {/* Search Status */}
      {value && (
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs sm:text-sm text-gray-300 font-medium">
              Searching for "<span className="text-purple-400 font-semibold">{value}</span>"
            </span>
          </div>
          {resultsCount !== null && (
            <div className="text-xs sm:text-sm text-gray-400 ml-6 sm:ml-0">
              {resultsCount === 0 ? 'No results' : `${resultsCount} result${resultsCount !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
      )}
      
      {/* Keyboard Shortcuts Hint */}
      {isFocused && (
        <div className="absolute top-full right-0 mt-2 px-3 py-1.5 bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-600/50 shadow-xl z-50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs font-mono">ESC</kbd>
            <span>to close</span>
          </div>
        </div>
      )}
    </div>
  );
}