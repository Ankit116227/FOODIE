import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("foodie-token"))
  );

  useEffect(() => {
    const updateLoginStatus = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("foodie-token")));
    };

    window.addEventListener("foodie-auth-change", updateLoginStatus);
    window.addEventListener("storage", updateLoginStatus);

    return () => {
      window.removeEventListener("foodie-auth-change", updateLoginStatus);
      window.removeEventListener("storage", updateLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("foodie-token");
    localStorage.removeItem("foodie-user");

    window.dispatchEvent(new Event("foodie-auth-change"));

    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          FOODIE
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/restaurants">
            Restaurants
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/my-orders">
              My Orders
            </NavLink>
          )}

          {!isLoggedIn ? (
            <>
              <NavLink to="/login">
                Login
              </NavLink>

              <NavLink to="/register">
                Register
              </NavLink>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="navbar-logout"
            >
              Logout
            </button>
          )}
        </nav>

        <Link to="/cart" className="cart-button">
          Cart
        </Link>
      </div>
    </header>
  );
}

export default Navbar;