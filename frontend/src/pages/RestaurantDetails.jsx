
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./RestaurantDetails.css";

function RestaurantDetails({ cartItems = [], setCartItems }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuError, setMenuError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let isMounted = true;

    const fetchRestaurant = async () => {
      try {
        const response = await api.get(`/restaurants/${id}`);

        if (isMounted) {
          setRestaurant(response.data.restaurant);
        }
      } catch (err) {
        console.error("Fetch Restaurant Error:", err);

        if (isMounted) {
          setError("Unable to load restaurant details. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchMenuItems = async () => {
      try {
        const response = await api.get(`/menu-items/restaurant/${id}`);

        console.log("Menu API Response:", response.data);

        // API response ko safely handle karo.
        const data = response.data;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.menuItems)
            ? data.menuItems
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.data)
                ? data.data
                : [];

        if (isMounted) {
          setMenuItems(items);
          setMenuError(
            items.length === 0
              ? "No menu items were returned by the API."
              : ""
          );
        }
      } catch (err) {
        console.error("Fetch Menu Items Error:", err);

        if (isMounted) {
          setMenuError("Unable to load menu. Please refresh and try again.");
        }
      } finally {
        if (isMounted) {
          setMenuLoading(false);
        }
      }
    };

    fetchRestaurant();
    fetchMenuItems();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const addToCart = (item) => {
    if (!setCartItems) {
      alert("Cart is not available right now. Please refresh the page.");
      return;
    }

    setCartItems((currentItems = []) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });

    alert(`${item.name} added to cart!`);
  };

  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category).filter(Boolean)),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="restaurant-message">
        <div className="restaurant-spinner" />
        <p>Loading restaurant...</p>
      </div>
    );
  }

  if (error) {
    return <div className="restaurant-message error-message">{error}</div>;
  }

  if (!restaurant) {
    return (
      <div className="restaurant-message">
        Restaurant not found.
      </div>
    );
  }

  return (
    <main className="restaurant-details-page">
      <section className="restaurant-hero">
        <div className="restaurant-hero-image">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="restaurant-hero-content">
          <span className="restaurant-tag">RESTAURANT</span>

          <h1>{restaurant.name}</h1>

          <p className="restaurant-description">
            {restaurant.description}
          </p>

          <div className="restaurant-info-grid">
            <div className="restaurant-info-item">
              <span className="info-icon">🍽️</span>
              <div>
                <small>Cuisine</small>
                <strong>{restaurant.cuisine}</strong>
              </div>
            </div>

            <div className="restaurant-info-item">
              <span className="info-icon">📍</span>
              <div>
                <small>Location</small>
                <strong>{restaurant.location}</strong>
              </div>
            </div>

            <div className="restaurant-info-item">
              <span className="info-icon">⭐</span>
              <div>
                <small>Rating</small>
                <strong>{restaurant.rating || "New"}</strong>
              </div>
            </div>
          </div>

          {restaurant.createdBy?.name && (
            <p className="restaurant-created-by">
              Managed by {restaurant.createdBy.name}
            </p>
          )}
        </div>
      </section>

      <section className="menu-section">
        <div className="menu-heading">
          <div>
            <span className="restaurant-tag">FRESH & DELICIOUS</span>
            <h2>Explore Our Menu</h2>
            <p>Choose your favourites and order something delicious.</p>
          </div>

          <div className="menu-count">
            {menuItems.length} {menuItems.length === 1 ? "item" : "items"}
          </div>
        </div>

        {!menuLoading && menuItems.length > 0 && (
          <div className="menu-categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "category-button active"
                    : "category-button"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {menuLoading && (
          <div className="restaurant-message">
            <div className="restaurant-spinner" />
            <p>Loading delicious food...</p>
          </div>
        )}

        {!menuLoading && menuError && (
          <div className="menu-empty-state">
            <span>🍽️</span>
            <h3>Menu is not available</h3>
            <p>{menuError}</p>
            <button
              className="menu-retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!menuLoading && !menuError && menuItems.length > 0 && (
          <div className="food-menu-grid">
            {filteredItems.map((item) => (
              <article className="food-card" key={item._id}>
                <div className="food-card-image">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                        event.currentTarget.parentElement.classList.add(
                          "image-fallback"
                        );
                      }}
                    />
                  ) : (
                    <div className="food-image-placeholder">🍲</div>
                  )}

                  <span
                    className={
                      item.isAvailable
                        ? "food-status available"
                        : "food-status unavailable"
                    }
                  >
                    {item.isAvailable ? "Available" : "Sold Out"}
                  </span>
                </div>

                <div className="food-card-content">
                  <span className="food-category">
                    {item.category || "Popular"}
                  </span>

                  <h3>{item.name}</h3>

                  <p className="food-description">
                    {item.description || "Freshly prepared and delicious."}
                  </p>

                  <div className="food-card-footer">
                    <span className="food-price">
                      ₹{Number(item.price).toFixed(0)}
                    </span>

                    <button
                      className="add-to-cart-button"
                      type="button"
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable}
                    >
                      {item.isAvailable ? "+ Add" : "Unavailable"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!menuLoading &&
          !menuError &&
          menuItems.length > 0 &&
          filteredItems.length === 0 && (
            <div className="menu-empty-state">
              <span>🔎</span>
              <h3>No items in this category</h3>
              <p>Choose another category to explore the menu.</p>
            </div>
          )}
      </section>

      <div className="restaurant-bottom-actions">
        <button
          className="back-restaurants-button"
          onClick={() => navigate("/restaurants")}
        >
          ← All Restaurants
        </button>

        <button
          className="view-cart-button"
          onClick={() => navigate("/cart")}
        >
          🛒 View Cart ({cartItems.reduce(
            (total, item) => total + (item.quantity || 1),
            0
          )})
        </button>
      </div>
    </main>
  );
}

export default RestaurantDetails;

