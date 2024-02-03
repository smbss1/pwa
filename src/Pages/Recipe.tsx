import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ProfilePage.css";
import { getApi, getUrl, patchApi } from "../Util/apiControleur";
import { useAuth } from "../Context/AuthContext";

const options: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

const Recipe = () => {
  const { recipeId } = useParams();
  let recipeId2: number = recipeId ? parseInt(recipeId, 10) : 0;
  const auth = useAuth();

  interface Recipe {
    some(arg0: (likedRecipe: { id: { toString: () => string | undefined; }; }) => boolean): unknown;
    author: any;
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

  const initialRecipe: Recipe = {
    id: 0,
    auteur: "",
    title: "",
    description: "",
    userId: 0,
    imageUrl: "",
    cookTime: "",
    likes: 0,
    category: "",
    date: new Date().toLocaleDateString(),
    ingredients: {},
    steps: [],
    author: undefined,
    some: function (arg0: (likedRecipe: { id: { toString: () => string | undefined; }; }) => boolean): unknown {
      throw new Error("Function not implemented.");
    }
  };

  const [recipe, setRecipes] = useState<Recipe>(initialRecipe);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getApi(`recipes/${recipeId}`);
        const data = await response.json();
        if (data) {
          const recipesWithAuthor = {
            ...data,
            auteur: data.author.username,
            date: new Date(data.date).toLocaleDateString(undefined, options),
          };
          setRecipes(recipesWithAuthor);
          console.log("recette", recipesWithAuthor);
        } else {
          console.log("aa");
        }
      } catch (error) {
        console.error("There was an error!", error);
      }
    };

    fetchData();
  }, []);

  const [liked, setLiked] = useState(true);
  
  function isRecipeLiked(recipes: Recipe[], recipeIdInput: number): boolean {
    return recipes.some(recipe => recipe.id === recipeIdInput);
  }

  useEffect(() => {
    if (!auth.isLoggedIn) return;

    const fetchData = async () => {
      try {
        const response = await getApi(`recipes/liked`);
        const data = await response.json();
        if (data) {
          console.log("recette likés/", data)
          let isLiked: boolean = isRecipeLiked(data, recipeId2);
          setLiked(isLiked);     
        } else {
          console.log("aa");
        }
      } catch (error) {
        console.error("There was an error!", error);
      }
    };

    fetchData();
  }, []);

  const navigate = useNavigate();

  const toggleLike = async () => {
    if (liked) {
      try {
        console.log("recette à:", `${getUrl()}recipes/unlike/${recipeId}`)
        const response = await patchApi(`recipes/unlike/${recipeId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setLiked(false);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    } else {
      try {
        console.log("recette à:", `${getUrl()}recipes/like/${recipeId}`)
        const response = await patchApi(`recipes/like/${recipeId}`, { id: recipeId });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setLiked(true);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    }
  };

  return (
    <div className="yellowBg">
      <div className="modal-backdrop">
        <div className="modal-content">
          <div className="corner top-left"></div>
          <div className="corner top-right"></div>
          <div className="corner bottom-left"></div>
          <div className="corner bottom-right"></div>
          <button
            className="modal-close-button"
            onClick={() => {
              navigate(-1);
            }}
          >
            ×
          </button>
          <div className="modal-content-left">
            <div className="modal-body">
              <p>{recipe.description}</p>
              <p>
                <strong>Ingrédients:</strong>
              </p>
              <ul>
                {Object.entries(recipe.ingredients).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Étapes:</strong>
              </p>
              <ol>
                {Object.entries(recipe.steps).map(([step, description]) => (
                  <li key={step}>{description}</li>
                ))}
              </ol>
            </div>
          </div>
          <div className="modal-content-right">
            <div className="modal-img">
              <img src={recipe.imageUrl} alt={recipe.title} />
            </div>
            <div className="modal-header">
              <h1 className="text-center">{recipe.title}</h1>
              <h4 className="text-center">
                Par{" "}
                <Link
                  to={`/profile/${recipe.auteur}/${recipe.userId}`}
                  className="author"
                >
                  {recipe.auteur}
                </Link>
              </h4>
            </div>
            { auth.isLoggedIn && (
              <button onClick={toggleLike}>
                {liked ? "Ne plus aimé" : "Aimé"}
              </button>
            )}
            <p>ajouté le {recipe.date}</p>
          </div>
          <div className="modal-footer">{}</div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;
