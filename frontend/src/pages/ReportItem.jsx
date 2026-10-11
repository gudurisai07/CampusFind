
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import "./ReportItem.css";

const initialForm = {
  itemType: "LOST",
  itemName: "",
  category: "",
  color: "",
  location: "",
  eventDate: "",
  description: "",
  contactName: "",
  contactEmail: "",
};

function ReportItem() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        contactName: current.contactName || user.fullName || "",
        contactEmail: current.contactEmail || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const selectedFile = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!selectedFile) {
      setImage(null);
      setImagePreview("");
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      event.target.value = "";
      setImage(null);
      setImagePreview("");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      event.target.value = "";
      setImage(null);
      setImagePreview("");
      return;
    }

    setImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!image) {
      setError("Please upload an item photo.");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: { from: "/report" },
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("image", image);

      await apiClient.post("/items/with-image", formData);

      setSuccess("Your item report has been submitted successfully!");

      setForm({
        ...initialForm,
        contactName: user.fullName || "",
        contactEmail: user.email || "",
      });

      setImage(null);
      setImagePreview("");

      const fileInput = document.getElementById("report-item-photo");

      if (fileInput) {
        fileInput.value = "";
      }

      window.setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Report submission failed:", err);

      if (err.response?.status === 401) {
        setError("Your login session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to submit this report.");
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to submit the report. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="report-page">
      <div className="report-container">
        <header className="report-heading">
          <div className="report-icon">📦</div>

          <p className="report-eyebrow">HELP YOUR CAMPUS COMMUNITY</p>

          <h1>
            Report an <span>Item</span>
          </h1>

          <p className="report-subtitle">
            Share an item photo and its details to help it find its way home.
          </p>
        </header>

        <form className="report-card" onSubmit={handleSubmit}>
          <div className="report-card-heading">
            <div>
              <h2>Item Information</h2>
              <p>Fields marked with * are required.</p>
            </div>

            <span className="report-step">NEW REPORT</span>
          </div>

          {error && (
            <div className="report-alert report-alert-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="report-alert report-alert-success" role="status">
              {success}
            </div>
          )}

          <div className="report-grid">
            <label className="report-field">
              <span>Report Type *</span>

              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                required
              >
                <option value="LOST">I lost an item</option>
                <option value="FOUND">I found an item</option>
              </select>
            </label>

            <label className="report-field">
              <span>Item Name *</span>

              <input
                type="text"
                name="itemName"
                placeholder="Example: Blue water bottle"
                value={form.itemName}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </label>

            <label className="report-field">
              <span>Category *</span>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option value="Bottle">Bottle</option>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Bag">Bag</option>
                <option value="ID Card">ID Card</option>
                <option value="Keys">Keys</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="report-field">
              <span>Colour</span>

              <input
                type="text"
                name="color"
                placeholder="Example: Blue"
                value={form.color}
                onChange={handleChange}
                maxLength={50}
              />
            </label>

            <label className="report-field">
              <span>Location *</span>

              <input
                type="text"
                name="location"
                placeholder="Where was it lost or found?"
                value={form.location}
                onChange={handleChange}
                maxLength={200}
                required
              />
            </label>

            <label className="report-field">
              <span>Date *</span>

              <input
                type="date"
                name="eventDate"
                value={form.eventDate}
                onChange={handleChange}
                required
              />
            </label>

            <label className="report-field report-field-full">
              <span>Description *</span>

              <textarea
                name="description"
                placeholder="Describe identifying marks, brand or other details..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                maxLength={2000}
                required
              />

              <small>{form.description.length}/2000 characters</small>
            </label>

            <div className="report-field report-field-full">
              <label htmlFor="report-item-photo">
                Item Photo *
              </label>

              <label
                htmlFor="report-item-photo"
                className="report-upload-box"
              >
                {imagePreview ? (
                  <img
                    className="report-image-preview"
                    src={imagePreview}
                    alt="Selected item preview"
                  />
                ) : (
                  <>
                    <span className="report-upload-icon">☁️</span>
                    <strong>Choose an item photo</strong>
                    <span>Click to browse files (maximum 5 MB)</span>
                    <span className="report-upload-button">
                      Select Image
                    </span>
                  </>
                )}

                <input
                  id="report-item-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </label>

              {image && (
                <div className="report-selected-file">
                  <span>{image.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview("");

                      const input =
                        document.getElementById("report-item-photo");

                      if (input) input.value = "";
                    }}
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="report-section-divider" />

          <div className="report-card-heading report-contact-heading">
            <div>
              <h2>Contact Information</h2>
              <p>These details help people contact you about the item.</p>
            </div>
            <span className="report-contact-icon">👤</span>
          </div>

          <div className="report-grid">
            <label className="report-field">
              <span>Your Name *</span>

              <input
                type="text"
                name="contactName"
                placeholder="Your full name"
                value={form.contactName}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </label>

            <label className="report-field">
              <span>Contact Email *</span>

              <input
                type="email"
                name="contactEmail"
                placeholder="you@example.com"
                value={form.contactEmail}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </label>
          </div>

          <div className="report-form-actions">
            <Link to="/" className="report-cancel-button">
              Cancel
            </Link>

            <button
              type="submit"
              className="report-submit-button"
              disabled={loading}
            >
              {loading ? "Submitting Report..." : "Submit Report →"}
            </button>
          </div>

          <p className="report-privacy-note">
            🔒 Your report will be saved in CampusFind for the community.
          </p>
        </form>
      </div>
    </main>
  );
}

export default ReportItem;
