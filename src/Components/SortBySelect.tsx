import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import "./SortBySelect.css"

interface SortBySelectProps {
  sortValue: string;
  handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SortBySelect: React.FC<SortBySelectProps> = ({ sortValue, handleChange }) => {
  return (
    <div className="sortby">
      <label htmlFor="sortby">Sort by:</label>
      <select
        className="select-sortby"
        id="sortby"
        name="sortby"
        value={sortValue}
        onChange={handleChange}
      >
        <option className="option-sortby" value="recent">
          Récents
        </option>
        <option className="option-sortby" value="oldest">
          Anciens
        </option>
        <option className="option-sortby" value="most_liked">
          Plus aimés
        </option>
      </select>
      <FontAwesomeIcon className="icon" icon={faChevronDown} />
    </div>
  );
};

export default SortBySelect;