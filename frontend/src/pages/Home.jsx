
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicItems } from "../api/itemApi";
import { useAuth } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const galleryRef = useRef(null);

  useEffect(() => {
    let active = true;

    getPublicItems()
      .then((data) => {
        if (active) {
          setItems(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        console.error("Public items failed:", err);

        if (active) {
          setError("Items load avvaledu. Please try again.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === "ALL") {
      return items;
    }

    return items.filter((item) =>
      String(item.itemType || "")
        .toUpperCase()
        .includes(filter)
    );
  }, [items, filter]);

  function browseItems() {
    galleryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function reportItem() {
    if (!user) {
      navigate("/login", {
        state: { from: "/report" },
      });
      return;
    }

    navigate("/report");
  }

  function openItem(item) {
    const destination = `/items/${item.id}`;

    if (!user) {
      navigate("/login", {
        state: { from: destination },
      });
      return;
    }

    navigate(destination);
  }

  return (
    <main className="campus-home">
      <section className="campus-hero">
        <div className="campus-hero-content">
          <span className="campus-eyebrow">
            CAMPUS COMMUNITY
          </span>

          <h1>
            Lost something?
            <span> Let's find it together.</span>
          </h1>

          <p>
            Lost it, found it, share it. Help campus belongings
            find their way home.
          </p>

          <div className="campus-hero-actions">
            <button
              type="button"
              className="campus-primary-button"
              onClick={reportItem}
            >
              + Report an Item
            </button>

            <button
              type="button"
              className="campus-secondary-button"
              onClick={browseItems}
            >
              Browse Items
            </button>
          </div>

          <div className="campus-trust-note">
            A little help can bring something important home.
          </div>
        </div>

        <div className="campus-hero-art" aria-hidden="true">
          <div className="campus-art-circle">
            <span>🔎</span>
          </div>
          <div className="campus-art-label">
            Lost &amp; Found
          </div>
        </div>
      </section>

      <section
        className="campus-gallery-section"
        ref={galleryRef}
      >
        <div className="campus-gallery-heading">
          <div>
            <span className="campus-eyebrow">
              COMMUNITY BOARD
            </span>

            <h2>Browse Items</h2>

            <p>
              Select an image to view its details.
            </p>
          </div>

          <button
            type="button"
            className="campus-primary-button"
            onClick={reportItem}
          >
            Report Item
          </button>
        </div>

        <div
          className="campus-filter-bar"
          aria-label="Filter items"
        >
          {[
            { label: "All Items", value: "ALL" },
            { label: "Lost", value: "LOST" },
            { label: "Found", value: "FOUND" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                filter === option.value
                  ? "campus-filter active"
                  : "campus-filter"
              }
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="campus-gallery-message">
            Loading items...
          </p>
        )}

        {!loading && error && (
          <p className="campus-gallery-message campus-error">
            {error}
          </p>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <p className="campus-gallery-message">
            No item images found in this category yet.
          </p>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="campus-image-grid">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="campus-image-card"
                onClick={() => openItem(item)}
                aria-label="Open item details"
              >
                <img
                  src={item.imageUrl}
                  alt="Lost and found item"
                  loading="lazy"
                />
                <span className="campus-image-overlay">
                  View item <span aria-hidden="true">→</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <footer className="campus-home-footer">
        <strong>CampusFind</strong>
        <span>Bringing lost belongings back to their owners.</span>
      </footer>
    </main>
  );
}

export default Home;
