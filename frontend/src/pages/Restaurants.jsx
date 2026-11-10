import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "./Restaurants.css";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/restaurants");

        setRestaurants(response.data.restaurants || []);
      } catch (error) {
        console.error("Fetch Restaurants Error:", error);
        setError("Unable to load restaurants. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const trimmedSearch = searchInput.trim();

    if (trimmedSearch) {
      setSearchParams({ search: trimmedSearch });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    const searchableText = [
      restaurant.name,
      restaurant.cuisine,
      restaurant.description,
      restaurant.location,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  if (loading) {
    return (
      <div className="restaurants-page">
        <div className="restaurants-container">
          <p className="restaurants-message">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurants-page">
        <div className="restaurants-container">
          <p className="restaurants-error">{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurants-page">
      <div className="restaurants-container">
        <div className="restaurants-header">
          <span className="section-label">EXPLORE FOOD</span>

          <h1>Discover Restaurants</h1>

          <p>
            Find restaurants and discover delicious food around you.
          </p>

          <form className="restaurants-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search by restaurant, cuisine or location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search restaurants"
            />

            <button type="submit">Search</button>

            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}
          </form>

          {searchQuery && (
            <p className="search-result-label">
              Search results for: <strong>{searchQuery}</strong>
            </p>
          )}
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="restaurants-empty">
            <div className="empty-search-icon">🔎</div>

            <h2>
              {searchQuery
                ? "No matching restaurants found"
                : "No restaurants available"}
            </h2>

            <p>
              {searchQuery
                ? "Try another restaurant name, cuisine or location."
                : "New restaurants will appear here soon."}
            </p>

            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={clearSearch}
              >
                Show All Restaurants
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="restaurants-results-header">
              <h2>
                {searchQuery ? "Search Results" : "All Restaurants"}
              </h2>

              <span>
                {filteredRestaurants.length}{" "}
                {filteredRestaurants.length === 1
                  ? "restaurant"
                  : "restaurants"}
              </span>
            </div>

            <div className="restaurants-grid">
              {filteredRestaurants.map((restaurant) => (
                <div className="restaurant-card" key={restaurant._id}>
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="restaurant-image"
                    />
                  ) : (
                    <div className="restaurant-image restaurant-image-placeholder">
                      🍽️
                    </div>
                  )}

                  <div className="restaurant-content">
                    <div className="restaurant-top">
                      <h2>{restaurant.name}</h2>

                      <span className="restaurant-rating">
                        ★ {restaurant.rating || "New"}
                      </span>
                    </div>

                    <p className="restaurant-cuisine">
                      {restaurant.cuisine}
                    </p>

                    <p className="restaurant-description">
                      {restaurant.description}
                    </p>

                    <p className="restaurant-location">
                      📍 {restaurant.location}
                    </p>

                    <Link
                      to={`/restaurants/${restaurant._id}`}
                      className="restaurant-details-btn"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Restaurants;