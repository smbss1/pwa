import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import './SearchInput.css'

interface SearchInputProps {
  inputValue: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions: string[];
  handleSuggestionClick: (suggestion: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ inputValue, handleChange, suggestions, handleSuggestionClick }) => {
  return (
    <div className="inputSearch">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Tapez quelque chose..."
      />
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      <FontAwesomeIcon className="icon" icon={faMagnifyingGlass} />
    </div>
  );
};

export default SearchInput;