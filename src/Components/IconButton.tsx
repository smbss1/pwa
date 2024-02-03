import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import './IconButton.css';

interface IconButtonProps {
  icon: IconDefinition;
  label: string;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick }) => {
  return (
    <button className='iconButton' onClick={onClick}>
      <FontAwesomeIcon className="icon" icon={icon} />
      {label}
    </button>
  );
};

export default IconButton;
