import React, { useCallback, useEffect, useState } from "react";
import {
  faPizzaSlice,
  faCake,
  faBowlFood,
  faDrumstickBite,
  faEllipsis,
  faBurger,
  faHeart,
  faPlateWheat,
} from "@fortawesome/free-solid-svg-icons";
import "./HomePage.css";
import IconButton from "../Components/IconButton";
import SearchInput from "../Components/SearchInput";
import SortBySelect from "../Components/SortBySelect";
import Navbar from "../Components/Navbar";
import RecipeCard from "../Components/RecipeCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApi } from "../Util/apiControleur";
import { useAuth } from "../Context/AuthContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useServiceWorkerMessage } from "../hooks/useServiceWorkerMessage";
import { getAllRecipes } from "../features/recipes/index.api";
import { Loader } from "../Components/Loader";

const HomePage = () => {
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sortValue, setSortValue] = useState<string>('recent');
  const [inputValue, setInputValue] = useState<string>('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = useAuth();

  let category = searchParams.get('category') || '';
  const isOnline = useNetworkStatus();

  const { data, error, refetch: fetchAllRecipes } = getAllRecipes.use({});
  
  useEffect(() => {
    if (data) {
      const recipesWithAuthor = data.map(recipe => ({
        ...recipe,
        auteur: recipe.author.username,
      }));
      setRecipes(recipesWithAuthor);
    } else {
      setRecipes([]);
    }
  }, [data]);

  // useEffect(() => {
  //   if (!isOnline)
  //     return;
  //   fetchUserRecipe();
  // }, [fetchUserRecipe, isOnline]);

  useServiceWorkerMessage('RECIPE_SYNC_COMPLETED', fetchAllRecipes);

  const handleCategoryClick = useCallback((category: string) => {
    setSearchParams({ category: category });

    if (category === 'Tout') {
      setFilteredRecipes(recipes);
      return;
    }

    const filtered = recipes.filter(recipe => recipe.category === category);
    setFilteredRecipes(filtered);
  }, [recipes, setSearchParams]);

  const handleFavoriteClick = useCallback(async () => {
    if (!auth.isLoggedIn) {
      return;
    }
    setSearchParams({ category: 'Favorite' });
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getApi(`recipes/liked`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const recipesWithAuthor = data.map(recipe => ({
            ...recipe,
            auteur: recipe.author.username,
          }));
          setIsLoading(false);
          return recipesWithAuthor;
        } else {
          setIsLoading(false);
          return [];
        }
      } catch (error) {
        console.error('There was an error!', error);
        setIsLoading(false);
        return [];
      }
    };

    fetchData().then(likedRecipes => setFilteredRecipes(likedRecipes));
  }, [setSearchParams]);

  useEffect(() => {
    if (!isOnline)
      return;
    if (category === '')
      return;

    if (category === 'Favorite') {
      handleFavoriteClick();
      return;
    }

    handleCategoryClick(category);
  }, [category, handleCategoryClick, handleFavoriteClick, recipes, isOnline]);

  useEffect(() => {
    if (!isOnline)
      return;
    if (category !== '')
      return;
    sortRecipes(sortValue); // Call sortRecipes when sortValue changes or recipes data is updated
  }, [sortValue, recipes, isOnline]);

  const sortRecipes = (sortOrder: string) => {
    let sortedRecipes = [...recipes];
    switch (sortOrder) {
      case 'recent':
        sortedRecipes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'oldest':
        sortedRecipes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'most_liked':
        sortedRecipes.sort((a, b) => b.likes - a.likes);
        break;
    }
    setFilteredRecipes(sortedRecipes);
  };

  const handleChangeSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortValue(event.target.value);
  };

  const handleChangeSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (!value) {
      sortRecipes(sortValue);
    } else {
      const filtered = recipes.filter(recipe => recipe.title.toLowerCase().includes(value.toLowerCase()) || recipe.description.toLowerCase().includes(value.toLowerCase()));
      setFilteredRecipes(filtered);
    }
  };

  const handleCardClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);

    const filtered = recipes.filter(recipe => recipe.title.toLowerCase().includes(suggestion.toLowerCase()));
    setFilteredRecipes(filtered);
  };

  return (
    <div className="page-home">
      <div className="header">
        <Navbar />
        <img src="cuisto.png" alt="cuisto"></img>
        <h1>GRAILLEs</h1>
      </div>
      <div className="content-home">
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="categories">
          <h1>Recettes</h1>
          <div className="button-container">
            <IconButton icon={faPlateWheat} label="Tout" onClick={() => handleCategoryClick("Tout")} />
            <IconButton icon={faPizzaSlice} label="Pizza" onClick={() => handleCategoryClick("Pizza")} />
            <IconButton icon={faBurger} label="Burger" onClick={() => handleCategoryClick("Burger")} />
            <IconButton icon={faBowlFood} label="Nouille" onClick={() => handleCategoryClick("Nouille")} />
            <IconButton icon={faDrumstickBite} label="Viande" onClick={() => handleCategoryClick("Viande")} />
            <IconButton icon={faCake} label="Dessert" onClick={() => handleCategoryClick("Dessert")} />
            <IconButton icon={faEllipsis} label="Autre" onClick={() => handleCategoryClick("Autre")} />
            {auth.isLoggedIn && <IconButton icon={faHeart} label="Favoris" onClick={() => handleFavoriteClick()} /> }
          </div>
        </div>
        <div className="res">
          <div className="navigation">
            <SearchInput inputValue={inputValue} handleChange={handleChangeSearchInput} suggestions={suggestions} handleSuggestionClick={handleSuggestionClick} />
            <SortBySelect sortValue={sortValue} handleChange={handleChangeSelect} />
          </div>
          <div className="results">
            <Loader data={recipes} isLoading={isLoading} empty={<h2>Aucune recette trouvée</h2>}>
              {filteredRecipes.map((recipe, index) => (
                <RecipeCard key={index} imageUrl={recipe.imageUrl} title={recipe.title} description={recipe.description} cookTime={recipe.cookTime} likes={recipe.likes} onCardClick={() => handleCardClick(recipe)} />
              ))}
            </Loader>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
