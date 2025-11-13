import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIcon } from '@assets/icons';

interface Suggestion {
  text: string;
  image?: string;
}

interface SearchBarProps {
  size?: 'normal' | 'small';
  placeholder?: string;
  suggestions?: Suggestion[];
  onEnterRoute?: string; 
  onSuggestionClickRoute?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  size = 'normal',
  placeholder = 'Search...',
  suggestions = [],
  onEnterRoute = '/search_games',
  onSuggestionClickRoute = '/select_lobby_by_game',
}) => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null);

  const isSmall = size === 'small';

  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.text.toLowerCase().includes(searchPhrase.toLowerCase())
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (searchPhrase.trim()) {
        navigate(`${onEnterRoute}/${searchPhrase}`);
      } else {
        navigate(onEnterRoute);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (phrase: string) => {
    navigate(`${onSuggestionClickRoute}/${phrase}`);
    setShowSuggestions(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xl" ref={searchBarRef}>
      <div
        className={`flex items-center bg-white rounded-full shadow-md ${
          isSmall ? 'px-3 py-1' : 'px-4 py-2'
        }`}
      >
        <input
          type="text"
          value={searchPhrase}
          onChange={(e) => {
            setSearchPhrase(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 text-gray-500 placeholder-gray-400 focus:outline-none ${
            isSmall ? 'text-sm' : 'text-base'
          }`}
        />
        <button className="ml-2">
          <img
            src={searchIcon}
            alt="Search Icon"
            className={isSmall ? 'w-4 h-4' : 'w-5 h-5'}
          />
        </button>
      </div>
      {showSuggestions && (
        <ul
          className={`absolute bg-white border border-gray-300 rounded-md shadow-lg mt-1 z-10 ${
            isSmall ? 'w-[calc(100%-1.5rem)]' : 'w-full'
          }`}
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                {suggestion.image && (
                  <img
                    src={suggestion.image}
                    alt={suggestion.text}
                    className="w-8 h-8 object-cover"
                  />
                )}
                <span className="text-gray-700">{suggestion.text}</span>
              </li>
            ))
          ) : (
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
              onClick={() => {
                navigate(onEnterRoute);
                setShowSuggestions(false);
              }}
            >
              No results - Show all
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
