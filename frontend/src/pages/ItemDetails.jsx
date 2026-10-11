
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../api/apiClient";
import "./ItemDetails.css";

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ItemDetails() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItem() {
      setLoading(true);
      setError("");

      try {
        const response = await apiClient.get(`/items/${id}`);

        if (active) {
          setItem(response.data);
        }
      } catch (err) {
        if (!active) return;

        if (err.response?.status === 401) {
          setError("Please log in to view this item's details.");
        } else if (err.response?.status === 404) {
          setError("This item could not be found.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load item details. Please try again."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItem();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="item-details-page">
        <div className="item-details-message">
          <div className="item-details-spinner" />
          <p>Loading item details...</p>
        </div>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="item-details-page">
        <section className="item-details-error">
          <div className="item-details-error-icon">!</div>
          <h1>Item details unavailable</h1>
          <p>{error || "This item could not be found."}</p>
          <Link to="/" className="item-details-primary">
            Back to Home
          </Link>
        </section>
      </main>
    );
  }

  const status = item.status || "OPEN";
  const itemType = String(item.itemType || "ITEM").toUpperCase();

  return (
    <main className="item-details-page">
      <div className="item-details-container">
        <Link to="/" className="item-details-back">
          ← Back to all items
        </Link>

        <section className="item-details-card">
          <div className="item-details-photo">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.itemName || "Lost and found item"}
              />
            ) : (
              <div className="item-details-no-photo">
                <span>📦</span>
                <p>No image available</p>
              </div>
            )}
          </div>

          <div className="item-details-content">
            <div className="item-details-badges">
              <span
                className={`item-details-type ${
                  itemType === "FOUND" ? "is-found" : "is-lost"
                }`}
              >
                {itemType}
              </span>

              <span
                className={`item-details-status ${
                  status.toUpperCase() === "RETURNED" ? "is-returned" : ""
                }`}
              >
                {status.replaceAll("_", " ")}
              </span>
            </div>

            <p className="item-details-eyebrow">ITEM INFORMATION</p>
            <h1>{item.itemName || "Unnamed item"}</h1>

            <p className="item-details-description">
              {item.description || "No description provided."}
            </p>

            <div className="item-details-divider" />

            <h2>Item information</h2>

            <div className="item-details-info-grid">
              <div className="item-details-info">
                <span className="item-details-info-icon">🏷️</span>
                <div>
                  <span className="item-details-label">Category</span>
                  <strong>{item.category || "Not provided"}</strong>
                </div>
              </div>

              <div className="item-details-info">
                <span className="item-details-info-icon">🎨</span>
                <div>
                  <span className="item-details-label">Colour</span>
                  <strong>{item.color || "Not provided"}</strong>
                </div>
              </div>

              <div className="item-details-info">
                <span className="item-details-info-icon">📍</span>
                <div>
                  <span className="item-details-label">Location</span>
                  <strong>{item.location || "Not provided"}</strong>
                </div>
              </div>

              <div className="item-details-info">
                <span className="item-details-info-icon">📅</span>
                <div>
                  <span className="item-details-label">Date</span>
                  <strong>{formatDate(item.eventDate)}</strong>
                </div>
              </div>
            </div>

            <div className="item-details-divider" />

            <section className="item-reporter-section">
              <div className="item-reporter-heading">
                <span className="item-reporter-avatar">👤</span>
                <div>
                  <h2>Reported by</h2>
                  <p>Contact the person who reported this item.</p>
                </div>
              </div>

              <div className="item-reporter-details">
                <div>
                  <span className="item-details-label">Name</span>
                  <strong>{item.contactName || "Not provided"}</strong>
                </div>

                {item.contactPhone && (
                  <div>
                    <span className="item-details-label">Phone</span>
                    <strong>{item.contactPhone}</strong>
                  </div>
                )}

                <div>
                  <span className="item-details-label">Email</span>
                  <strong className="item-reporter-email">
                    {item.contactEmail || "Not provided"}
                  </strong>
                </div>
              </div>
            </section>

            <p className="item-details-privacy">
              Contact the reporter respectfully and verify the item's details
              before collecting it.
            </p>

            <Link to="/" className="item-details-primary">
              ← Browse other items
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ItemDetails;
