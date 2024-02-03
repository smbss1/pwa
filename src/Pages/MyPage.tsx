import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { faUtensils, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "../Components/Navbar";
import RecipeDetailsModal from "../Components/RecipeDetailsModal";
import RecipeCard from "../Components/RecipeCard";
import RecipeModalForm from "../Components/RecipeModalForm";
import Modal from "../Components/Modal";
import "./ProfilePage.css";
import { deleteApi, getApi } from "../Util/apiControleur";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useServiceWorkerMessage } from "../hooks/useServiceWorkerMessage";
import { ClipLoader } from "react-spinners";

const MyPage = () => {
    interface Recipe {
        id: number;
        auteur: string; // Ajout de la propriété 'auteur'
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

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { author } = useParams();
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUserRecipe = async () => {
      setIsLoading(true);
      const userId = localStorage.getItem("userId");
    try {
      const response = await getApi(`recipes/users/${userId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const recipesWithAuthor = data.map(recipe => ({
          ...recipe,
          auteur: recipe.author.username, // Assume `author` is already part of each recipe object.
        }));
        setRecipes(recipesWithAuthor);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('There was an error!', error);
      setRecipes([]);
    }
    setIsLoading(false);
  };

  useServiceWorkerMessage('RECIPE_SYNC_COMPLETED', fetchUserRecipe);

  useEffect(() => {
    fetchUserRecipe();
  }, [isOnline]);

  const handleCardClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const canDelete = async (recipeId: number) => {
    try {
      await deleteApi(`recipes/${recipeId}`);
      await fetchUserRecipe();
    } catch (e) {
      console.error('There was an error!', e);
    }
  }

  return (
    <div className="page-profile">
      <Navbar />
      <div className="header">
        <img src="/cuisto.png" alt="cuisto" />
        <h1>{author}</h1>
      </div>
      <div className="content-home">
        <button className="btnCreateRecipe" onClick={openModal}>Créer une recette</button>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <RecipeModalForm onRecipeCreated={fetchUserRecipe}/>
        </Modal>
        <div className="pad">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="results">
              {isLoading ? (
                <ClipLoader className="loader" color={'#000'} loading={true} size={150} />
              ) : (
                <>
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
                          canDelete={evt => {
                            evt.stopPropagation();
                            canDelete(recipe.id)}
                          }
                      />
                      ))
                  ) : (
                      <p>Aucune recette trouvée</p>
                  )}
                  </>
              )}
                </div>
                {selectedRecipe && (
                <RecipeDetailsModal
                    recipe={{ ...selectedRecipe, date: new Date(selectedRecipe.date) }}
                    onClose={() => setSelectedRecipe(null)}
                />
                )}
            </div>
        </div> 
    </div>
  );
};

export default MyPage;
