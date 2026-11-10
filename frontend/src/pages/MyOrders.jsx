
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const orderStatuses = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

const statusColors = {
  Placed: { background: "#fff3cd", color: "#856404" },
  Confirmed: { background: "#cfe2ff", color: "#084298" },
  Preparing: { background: "#ffe5d0", color: "#9a3412" },
  "Out for Delivery": { background: "#e0d7ff", color: "#5b21b6" },
  Delivered: { background: "#d1e7dd", color: "#0f5132" },
  Cancelled: { background: "#f8d7da", color: "#842029" },
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("foodie-token");

      if (!token) {
        setOrders([]);
        setError("Please login to view your orders.");
        return;
      }

      const response = await api.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Fetch Orders Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <div style={styles.messageContainer}>
        <div style={styles.loader}></div>
        <h2>Loading orders...</h2>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div style={styles.messageContainer}>
        <h2 style={styles.heading}>My Orders</h2>
        <p style={styles.messageText}>{error}</p>

        {error.toLowerCase().includes("login") ? (
          <Link to="/login" style={styles.primaryButton}>
            Go to Login
          </Link>
        ) : (
          <button
            style={styles.primaryButton}
            onClick={() => fetchOrders()}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.heading}>My Orders</h1>
          <p style={styles.subtitle}>
            Track your orders and view your order history.
          </p>
        </div>

        <button
          type="button"
          style={{
            ...styles.refreshButton,
            opacity: refreshing ? 0.7 : 1,
          }}
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </div>

      {error && <p style={styles.inlineError}>{error}</p>}

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>🍽️</div>
          <h2>No Orders Yet</h2>
          <p>Your delicious food journey starts here!</p>

          <Link to="/restaurants" style={styles.primaryButton}>
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div style={styles.orderList}>
          {orders.map((order) => {
            const status = order.status || "Placed";
            const isCancelled = status === "Cancelled";
            const currentStep = orderStatuses.indexOf(status);
            const colors = statusColors[status] || statusColors.Placed;

            return (
              <div key={order._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.restaurant}>
                      {order.restaurant?.name || "Restaurant"}
                    </h2>

                    <p style={styles.location}>
                      {order.restaurant?.location ||
                        "Location unavailable"}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.status,
                      background: colors.background,
                      color: colors.color,
                    }}
                  >
                    {status}
                  </span>
                </div>

                {!isCancelled && (
                  <div style={styles.tracking}>
                    <h3 style={styles.trackingHeading}>
                      Order Progress
                    </h3>

                    <div style={styles.progressTrack}>
                      {orderStatuses.map((step, index) => {
                        const completed = currentStep >= index;

                        return (
                          <div key={step} style={styles.progressStep}>
                            <div
                              style={{
                                ...styles.progressDot,
                                background: completed
                                  ? "#198754"
                                  : "#dedede",
                                color: completed ? "#fff" : "#555",
                              }}
                            >
                              {completed ? "✓" : index + 1}
                            </div>

                            <span
                              style={{
                                ...styles.progressLabel,
                                color: completed ? "#198754" : "#777",
                                fontWeight: completed
                                  ? "bold"
                                  : "normal",
                              }}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {isCancelled && (
                  <p style={styles.cancelledMessage}>
                    This order has been cancelled.
                  </p>
                )}

                <div style={styles.sectionTitle}>Order Items</div>

                <div style={styles.items}>
                  {order.items?.map((item, index) => (
                    <div
                      key={item._id || `${item.name}-${index}`}
                      style={styles.item}
                    >
                      <span style={styles.itemName}>
                        {item.name} × {item.quantity}
                      </span>

                      <span style={styles.itemPrice}>
                        ₹
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 0)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={styles.summary}>
                  <p>
                    Subtotal
                    <span>
                      ₹{Number(order.subtotal || 0).toLocaleString("en-IN")}
                    </span>
                  </p>

                  <p>
                    Delivery Fee
                    <span>
                      ₹
                      {Number(order.deliveryFee || 0).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </p>

                  <h3>
                    Total Amount
                    <span>
                      ₹
                      {Number(order.totalAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </h3>
                </div>

                <div style={styles.footer}>
                  <span style={styles.orderId}>
                    Order ID: {order._id}
                  </span>

                  <span>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN")
                      : "Date unavailable"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    minHeight: "60vh",
  },

  messageContainer: {
    maxWidth: "600px",
    margin: "70px auto",
    padding: "30px 20px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  messageText: {
    color: "#666",
    lineHeight: 1.6,
    marginBottom: "24px",
  },

  loader: {
    width: "36px",
    height: "36px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #198754",
    borderRadius: "50%",
    margin: "0 auto 20px",
    animation: "spin 1s linear infinite",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },

  heading: {
    fontSize: "32px",
    margin: "0 0 8px",
    color: "#222",
  },

  subtitle: {
    color: "#666",
    margin: 0,
    lineHeight: 1.6,
  },

  refreshButton: {
    border: "none",
    borderRadius: "8px",
    padding: "11px 16px",
    background: "#198754",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },

  primaryButton: {
    display: "inline-block",
    border: "none",
    borderRadius: "8px",
    padding: "12px 20px",
    background: "#198754",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    textDecoration: "none",
    cursor: "pointer",
  },

  orderList: {
    display: "grid",
    gap: "24px",
  },

  card: {
    border: "1px solid #e5e5e5",
    borderRadius: "14px",
    padding: "24px",
    background: "#fff",
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)",
    minWidth: 0,
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    borderBottom: "1px solid #eee",
    paddingBottom: "16px",
  },

  restaurant: {
    margin: "0 0 6px",
    fontSize: "22px",
    color: "#222",
  },

  location: {
    margin: 0,
    color: "#777",
    fontSize: "14px",
  },

  status: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "13px",
  },

  tracking: {
    marginTop: "22px",
    padding: "18px 0",
    borderBottom: "1px solid #eee",
  },

  trackingHeading: {
    margin: "0 0 22px",
    fontSize: "18px",
    color: "#222",
  },

  progressTrack: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "8px",
  },

  progressStep: {
    display: "flex",
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "10px",
  },

  progressDot: {
    width: "32px",
    height: "32px",
    minWidth: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "bold",
    boxSizing: "border-box",
  },

  progressLabel: {
    fontSize: "12px",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
  },

  cancelledMessage: {
    margin: "20px 0",
    padding: "12px 14px",
    background: "#f8d7da",
    color: "#842029",
    borderRadius: "8px",
    fontSize: "14px",
  },

  sectionTitle: {
    marginTop: "20px",
    marginBottom: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },

  items: {
    display: "grid",
    gap: "12px",
    padding: "12px 0",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    fontSize: "14px",
  },

  itemName: {
    color: "#444",
    overflowWrap: "anywhere",
  },

  itemPrice: {
    fontWeight: "bold",
    color: "#333",
    whiteSpace: "nowrap",
  },

  summary: {
    borderTop: "1px solid #eee",
    paddingTop: "14px",
    marginTop: "10px",
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "20px",
    paddingTop: "14px",
    borderTop: "1px solid #eee",
    color: "#777",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  orderId: {
    overflowWrap: "anywhere",
  },

  inlineError: {
    padding: "12px 16px",
    background: "#f8d7da",
    color: "#842029",
    borderRadius: "8px",
    fontSize: "14px",
  },

  empty: {
    textAlign: "center",
    padding: "50px 20px",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "14px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
};

export default MyOrders;

