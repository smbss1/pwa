import { useNavigate, useParams } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../Components/Navbar";
import React, { useState } from "react";
import RecipeCard from "../Components/RecipeCard";
import NotificationModal from "../Components/NotificationModal";
import { useAuth } from "../Context/AuthContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useServiceWorkerMessage } from "../hooks/useServiceWorkerMessage";
import { ClipLoader } from "react-spinners";
import { Recipe } from "../features/recipes/index.type";
import { getRecipeByUser } from "../features/recipes/index.api";
import { Follower, followUser, getMe, unfollowUser } from "../features/users/index.api";
import { Loader } from "../Components/Loader";

const ProfilePage = () => {
  const { username, userId } = useParams();
  const auth = useAuth();
  const userIdNum = parseInt(userId ?? '0')

  const [isFollowing, setIsFollowing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  const { data: user } = getMe.use(undefined)
  const { data: recipes, isLoading, refetch: fetchRecipes } = getRecipeByUser.use(userIdNum, { skip: user === undefined })

  const handleCardClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  React.useEffect(() => {
    const isUserFollowing = user?.followers.some((follow: Follower) => follow.followingId === userIdNum) ?? false;
    setIsFollowing(isUserFollowing);
  }, [user]);

  const toggleFollow = async () => {
    if (Notification.permission === "default" && !isFollowing) {
      setShowNotificationModal(true);
    }
    const method = isFollowing ? unfollowUser : followUser;
    try {
      await method.initiate({ followerId: user?.id ?? 0, followingId: userIdNum })
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  useServiceWorkerMessage('RECIPE_SYNC_COMPLETED', fetchRecipes);

  return (
    <div className="page-profile">
      {showNotificationModal && (
        <NotificationModal onClose={() => setShowNotificationModal(false)} />
      )}
      <div className="header">
        <Navbar />
        <img src="/cuisto.png" alt="cuisto"></img>
        <h1>{username}</h1>
        {auth.isLoggedIn && (
          <button className="btnSubscribe" onClick={toggleFollow}>
            {isFollowing ? "Se désabonner" : "S'abonner"}
          </button>
        )}
      </div>
      <div className="content-home">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="res">
          <div className="results">
            <Loader data={recipes} isLoading={isLoading} empty={<p>Aucune recette trouvée</p>}>
              { recipes?.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  imageUrl={recipe.imageUrl}
                  title={recipe.title}
                  description={recipe.description}
                  cookTime={recipe.cookTime}
                  likes={recipe.likes}
                  onCardClick={() => handleCardClick(recipe)}
                />
              ))}
            </Loader>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
