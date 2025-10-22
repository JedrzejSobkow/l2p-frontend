import React from 'react';

interface SearchBarProps {
  size?: 'normal' | 'small';
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ size = 'normal', placeholder = 'Search...' }) => {
  const isSmall = size === 'small';

  return (
    <div
      className={`flex items-center bg-white rounded-full shadow-md ${
        isSmall ? 'px-3 py-1 max-w-sm' : 'px-4 py-2 max-w-xl w-full'
      }`}
    >
      <input
        type="text"
        placeholder={placeholder}
        className={`flex-1 text-gray-500 placeholder-gray-400 focus:outline-none ${
          isSmall ? 'text-sm' : 'text-base'
        }`}
      />
      <button className="ml-2">
        <img
          src="/src/assets/icons/search.png"
          alt="Search Icon"
          className={isSmall ? 'w-4 h-4' : 'w-5 h-5'}
        />
      </button>
    </div>
  );
};

export default SearchBar;
