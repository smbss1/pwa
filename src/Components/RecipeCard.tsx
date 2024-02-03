import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "./RecipeCard.css";

interface ReciepeCardProps {
  imageUrl: string;
  title: string;
  description: string;
  cookTime: string;
  likes: number;
  canDelete?: React.MouseEventHandler<HTMLButtonElement>;
  onCardClick: () => void;
}

const RecipeCard: React.FC<ReciepeCardProps> = ({
  imageUrl,
  title,
  description,
  cookTime,
  likes,
  canDelete,
  onCardClick,
}) => {
  return (
    <div className="card" onClick={onCardClick}>
      {canDelete && <button className="left-pos-card" onClick={canDelete}>X</button> }
      <div className="group">
        <div className="card-img">
          <img src={imageUrl} alt="reciepe img" />
        </div>
        <div className="group2">
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="group-bottom">
            <div className="group3">
              <p className="info">Personnes</p>
              <FontAwesomeIcon className="small-icon" icon={faUser} />
              <FontAwesomeIcon className="small-icon" icon={faUser} />
            </div>
            <div className="vertical-sep"></div>
            <div className="group3">
              <p className="info">Cuisson</p>
              <p className="time">{cookTime}h</p>
            </div>
            <div className="vertical-sep"></div>
            <div className="group3">
              <p className="info">Aimes</p>
              <button>
                <FontAwesomeIcon className="small-icon" icon={faUser} />
                <p className="time">{likes}</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
