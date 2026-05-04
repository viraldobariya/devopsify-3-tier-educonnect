// components/SearchBar.jsx
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder }) => {


  // return (
  //   <div className="relative flex-1 max-w-md">
  //     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
  //       <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  //       </svg>
  //     </div>
  //     <input
  //       type="text"
  //       value={value}
  //       onChange={onChange}
  //       placeholder={placeholder}
  //       className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  //     />
  //   </div>
  // );
  return (
    <div className="relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
      />
    </div>
  );
};

export default SearchBar;