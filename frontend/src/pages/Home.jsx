import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Home.css";

const categories = [
  { name: "Pizza", emoji: "🍕" },
  { name: "Burger", emoji: "🍔" },
  { name: "Biryani", emoji: "🍛" },
  { name: "Chinese", emoji: "🥡" },
  { name: "Desserts", emoji: "🍰" },
  { name: "Drinks", emoji: "🥤" },
];

function Home() {
  const [search, setSearch] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get("/restaurants");
        setRestaurants(response.data.restaurants || []);
      } catch (err) {
        console.error("Home Restaurants Error:", err);
        setError("Restaurants could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    navigate(
      `/restaurants${
        query ? `?search=${encodeURIComponent(query)}` : ""
      }`
    );
  };

  const handleCategoryClick = (category) => {
    navigate(`/restaurants?search=${encodeURIComponent(category)}`);
  };

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-tag">FOODIE · FOOD MADE EASY</span>

          <h1>
            Good food.
            <br />
            <span>Great mood.</span>
          </h1>

          <p>
            Discover delicious food and explore restaurants around you.
            Find your favourites and make every meal special.
          </p>

          <form className="search-box" onSubmit={handleSearch}>
            <span className="search-icon">⌕</span>

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or food..."
              aria-label="Search restaurants or food"
            />

            <button type="submit">Explore Food →</button>
          </form>

          <div className="hero-highlights">
            <span>✓ Easy ordering</span>
            <span>✓ Delicious choices</span>
            <span>✓ Simple checkout</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <span className="section-label">EXPLORE BY TASTE</span>
            <h2>What are you craving?</h2>
            <p className="section-description">
              Something delicious is just a click away.
            </p>
          </div>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <button
              className="category-card"
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              type="button"
            >
              <div className="category-icon">{category.emoji}</div>
              <h3>{category.name}</h3>
              <span className="category-arrow">Explore ↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="section popular-section">
        <div className="section-header">
          <div>
            <span className="section-label">FROM OUR DATABASE</span>
            <h2>Popular restaurants</h2>
            <p className="section-description">
              Discover restaurants available on FOODIE.
            </p>
          </div>

          <Link to="/restaurants" className="view-all-button">
            View all restaurants →
          </Link>
        </div>

        {loading ? (
          <div className="home-status">
            <p>Loading delicious options...</p>
          </div>
        ) : error ? (
          <div className="home-status home-status-error">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="home-status">
            <h3>No restaurants available yet</h3>
            <p>Restaurants added to FOODIE will appear here.</p>
            <Link to="/restaurants" className="cta-button">
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="restaurant-grid">
            {restaurants.slice(0, 3).map((restaurant, index) => (
              <article
                className="restaurant-card"
                key={restaurant._id}
              >
                <Link
                  to={`/restaurants/${restaurant._id}`}
                  className="home-restaurant-link"
                  aria-label={`View ${restaurant.name} details`}
                >
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="home-restaurant-image"
                    />
                  ) : (
                    <div
                      className={`restaurant-image restaurant-image-${(index % 3) + 1}`}
                    >
                      <span className="food-image-emoji">🍽️</span>
                      <span className="restaurant-image-label">
                        FOODIE RESTAURANT
                      </span>
                    </div>
                  )}
                </Link>

                <div className="restaurant-content">
                  <div className="restaurant-title-row">
                    <h3>{restaurant.name}</h3>

                    <span className="rating">
                      ★ {restaurant.rating || "New"}
                    </span>
                  </div>

                  <p>{restaurant.cuisine || "Delicious food"}</p>

                  <div className="restaurant-meta">
                    <span>📍 {restaurant.location || "Location unavailable"}</span>

                    <Link
                      to={`/restaurants/${restaurant._id}`}
                      className="home-view-details"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="home-bottom-cta">
          <div>
            <span className="section-label">HUNGRY ALREADY?</span>
            <h2>Your next favourite meal awaits.</h2>
            <p>Explore restaurants and discover something delicious.</p>
          </div>

          <Link to="/restaurants" className="cta-button">
            Browse Restaurants →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;