import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import RecipeCard from "../Components/RecipeCard";
import RecipeModalForm from "../Components/RecipeModalForm";
import Modal from "../Components/Modal";
import "./ProfilePage.css";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useServiceWorkerMessage } from "../hooks/useServiceWorkerMessage";
import { ClipLoader } from "react-spinners";
import { getMe } from "../features/users/index.api";
import { Recipe } from "../features/recipes/index.type";
import { deleteRecipe, getRecipeByUser } from "../features/recipes/index.api";

const MyPage = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  const { data: user } = getMe.use(undefined)
  const { data: recipes, isLoading, refetch: fetchRecipes } = getRecipeByUser.use(user?.id ?? 0, { skip: user === undefined })
  const { trigger: deleteRecipeTrigger } = deleteRecipe.use(0, { skip: user === undefined })

  useServiceWorkerMessage('RECIPE_SYNC_COMPLETED', fetchRecipes);

  // useEffect(() => {
  //   fetchRecipes();
  // }, [isOnline]);

  const handleCardClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const canDelete = async (recipeId: number) => {
    try {
      await deleteRecipeTrigger(recipeId);
    } catch (e) {
      console.error('There was an error!', e);
    }
  }

  return (
    <div className="page-profile">
      <Navbar />
      <div className="header">
        <img src="/cuisto.png" alt="cuisto" />
        <h1>{user?.username}</h1>
      </div>
      <div className="content-home">
        <button className="btnCreateRecipe" onClick={openModal}>Créer une recette</button>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <RecipeModalForm onRecipeCreated={fetchRecipes}/>
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
            </div>
        </div> 
    </div>
  );
};

export default MyPage;
