
import { Link } from "react-router-dom";

function ItemCard({ item }) {
  const itemType = (item.itemType || "UNKNOWN").toUpperCase();
  const status = (item.status || "OPEN").toUpperCase();

  return (
    <article className="item-card">
      <Link to={`/items/${item.id}`} className="item-card-link">
        <div className="item-image">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.itemName || "Lost or found item"}
              loading="lazy"
            />
          ) : (
            <div className="image-placeholder">
              <span>📷</span>
              <p>No photo available</p>
            </div>
          )}
        </div>

        <div className="item-card-content">
          <div className="badge-row">
            <span className={`type-badge ${itemType.toLowerCase()}`}>
              {itemType}
            </span>
            <span className="status-badge">{status}</span>
          </div>

          <h3>{item.itemName || "Untitled item"}</h3>
          <p className="item-description">
            {item.description || "No description provided."}
          </p>

          <div className="item-details">
            <p><strong>Category:</strong> {item.category || "N/A"}</p>
            <p><strong>Colour:</strong> {item.color || "N/A"}</p>
            <p><strong>Location:</strong> {item.location || "N/A"}</p>
            <p><strong>Date:</strong> {item.eventDate || "N/A"}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ItemCard;
