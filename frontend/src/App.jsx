import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import Navbar from "./components/Navbar";
import RestaurantDetails from "./pages/RestaurantDetails";

import api from "./services/api";
import MyOrders from "./pages/MyOrders";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Save JWT token
      localStorage.setItem("foodie-token", response.data.token);

      // Save logged-in user
      localStorage.setItem(
        "foodie-user",
        JSON.stringify(response.data.user)
      );
      window.dispatchEvent(new Event("foodie-auth-change"));

      alert("Login successful!");

      window.location.href = "/";
    } catch (error) {
      console.error("Login Error:", error);

      alert(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <br />

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      alert(response.data.message || "Registration successful!");

      setName("");
      setEmail("");
      setPassword("");

      window.location.href = "/login";
    } catch (error) {
      console.error("Registration Error:", error);

      alert(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #e5e5e5",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
      }}
    >
      <h1 style={{ textAlign: "center" }}>Create Account</h1>

      <p style={{ textAlign: "center", color: "#666" }}>
        Join FOODIE and discover delicious food!
      </p>

      <form onSubmit={handleRegister}>
        <label>Full Name</label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          autoComplete="name"
          required
          style={inputStyle}
        />

        <label>Email Address</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          required
          style={inputStyle}
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (minimum 6 characters)"
          autoComplete="new-password"
          minLength={6}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#198754" }}>
          Login
        </a>
      </p>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  margin: "8px 0 18px",
  border: "1px solid #ccc",
  borderRadius: "7px",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  background: "#198754",
  color: "#fff",
  border: "none",
  borderRadius: "7px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

function Cart({ cartItems, setCartItems }) {
  // Remove item completely from cart
  const removeFromCart = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== itemId)
    );
  };

  // Increase quantity
  const increaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === itemId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // Decrease quantity
  const decreaseQuantity = (itemId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item._id === itemId && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
    );
  };

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Delivery fee
  const deliveryFee = cartItems.length > 0 ? 40 : 0;

  // Grand total
  const grandTotal = subtotal + deliveryFee;

  // Place Order
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // Get restaurant ID from cart
      const restaurantId = cartItems[0].restaurant;

      // Prepare items for backend
      const orderItems = cartItems.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
      }));

      // Send order to backend
      const response = await api.post("/orders", {
        restaurant: restaurantId,
        items: orderItems,
      });

      // Show success message
      alert(response.data.message);

      // Clear cart after successful order
      setCartItems([]);
    } catch (error) {
      console.error("Checkout Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to place order. Please try again."
      );
    }
  };

  return (
    <div>
      <h1>Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {/* Cart Items */}
          {cartItems.map((item) => (
            <div key={item._id}>
              <h3>{item.name}</h3>

              <p>Price: ₹{item.price}</p>

              <div>
                <button onClick={() => decreaseQuantity(item._id)}>
                  -
                </button>

                <span> {item.quantity} </span>

                <button onClick={() => increaseQuantity(item._id)}>
                  +
                </button>
              </div>

              <p>
                Total: ₹{item.price * item.quantity}
              </p>

              <button onClick={() => removeFromCart(item._id)}>
                Remove
              </button>

              <hr />
            </div>
          ))}

          {/* Order Summary */}
          <div>
            <h2>Order Summary</h2>

            <p>
              Subtotal: ₹{subtotal}
            </p>

            <p>
              Delivery Fee: ₹{deliveryFee}
            </p>

            <hr />

            <h2>
              Grand Total: ₹{grandTotal}
            </h2>

            <button onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("foodie-cart");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("foodie-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/restaurants" element={<Restaurants />} />

        <Route
          path="/restaurants/:id"
          element={
            <RestaurantDetails
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          }
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          }
        />

        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;