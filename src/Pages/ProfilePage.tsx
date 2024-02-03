import { useNavigate, useParams } from "react-router-dom";
import "./ProfilePage.css";
import Navbar from "../Components/Navbar";
import { useEffect, useState } from "react";
import RecipeCard from "../Components/RecipeCard";
import NotificationModal from "../Components/NotificationModal";
import { getApi, getUrl } from "../Util/apiControleur";
import { useAuth } from "../Context/AuthContext";

const ProfilePage = () => {
  const { username, userId } = useParams();
  const myId = localStorage.getItem('userId');
  const auth = useAuth();

  interface Recipe {
    id: number;
    auteur: string;
    title: string;
    description: string;
    userId: number;
    imageUrl: string;
    cookTime: string;
    likes: number;
    category: string;
    date: string;
    ingredients: { [key: string]: string | number };
    steps: string[];
  }

  interface Follow {
    id: number;
    followerId: number;
    followingId: number;
  }

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!auth.isLoggedIn) return;
      try {
        const response = await getApi(`users/me`);
        const userData = await response.json();
        const isUserFollowing = userData.followers.some((follow: Follow) => follow.followingId === parseInt(userId || '0'));
        setIsFollowing(isUserFollowing);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchProfileData();
  }, [userId]);

  const toggleFollow = async () => {
    if (Notification.permission === "default" && !isFollowing) {
      setShowNotificationModal(true);
    }
    const accessToken = localStorage.getItem('accessToken');
    const url = `${getUrl()}followers/${isFollowing ? 'unfollow' : 'follow'}`;
    const method = isFollowing ? 'DELETE' : 'POST';
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ followerId: parseInt(myId || '0'), followingId: parseInt(userId || '0') }),
      });
      console.log("res:", response)
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getApi(`recipes/users/${userId}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const recipesWithAuthor = data.map(recipe => ({
            ...recipe,
            auteur: recipe.author.username,
          }));
          setRecipes(recipesWithAuthor);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.error('There was an error!', error);
        setRecipes([]);
      }
    };

    fetchData();
  }, []);

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
            {recipes && recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  imageUrl={recipe.imageUrl}
                  title={recipe.title}
                  description={recipe.description}
                  cookTime={recipe.cookTime}
                  likes={recipe.likes}
                  onCardClick={() => handleCardClick(recipe)}
                />
              ))
            ) : (
              <p>Aucune recette trouvée</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
