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
  onCardClick: () => void;
}

const RecipeCard: React.FC<ReciepeCardProps> = ({
  imageUrl,
  title,
  description,
  cookTime,
  likes,
  onCardClick,
}) => {
  return (
    <div className="card" onClick={onCardClick}>
      <div className="group">
        <div className="card-img">
          <img src={imageUrl} alt="reciepe img" />
        </div>
        <div className="group2">
          <h2>{title}</h2>
          <p>{description}</p>
          <div className="group-bottom">
            <div className="group3">
              <p className="info">Serving</p>
              <FontAwesomeIcon className="small-icon" icon={faUser} />
              <FontAwesomeIcon className="small-icon" icon={faUser} />
            </div>
            <div className="vertical-sep"></div>
            <div className="group3">
              <p className="info">Cook time</p>
              <p className="time">{cookTime}</p>
            </div>
            <div className="vertical-sep"></div>
            <div className="group3">
              <p className="info">Likes</p>
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
