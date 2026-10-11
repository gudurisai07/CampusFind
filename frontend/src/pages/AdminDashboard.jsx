
import { useCallback, useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import "./AdminDashboard.css";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN");
}

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardRes, usersRes, itemsRes] = await Promise.all([
        apiClient.get("/admin/dashboard"),
        apiClient.get("/admin/users"),
        apiClient.get("/admin/items"),
      ]);

      setStats(dashboardRes.data);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.status === 401
          ? "Please login again."
          : err.response?.status === 403
            ? "Admin access is required."
            : err.response?.data?.message ||
              "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const visibleUsers = users.filter((user) => {
    const search = userSearch.toLowerCase();

    return (
      String(user.id ?? "").includes(search) ||
      String(user.fullName ?? "").toLowerCase().includes(search) ||
      String(user.email ?? "").toLowerCase().includes(search)
    );
  });

  const visibleItems = items.filter((item) => {
    const search = itemSearch.toLowerCase();

    return (
      String(item.id ?? "").includes(search) ||
      String(item.itemName ?? "").toLowerCase().includes(search) ||
      String(item.location ?? "").toLowerCase().includes(search) ||
      String(item.contactName ?? "").toLowerCase().includes(search)
    );
  });

  async function updateStatus(itemId, status) {
    try {
      await apiClient.patch(`/admin/items/${itemId}/status`, { status });
      setNotice(`Item #${itemId} updated to ${status}.`);
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update item status."
      );
    }
  }

  async function deleteItem(item) {
    const confirmed = window.confirm(
      `Delete "${item.itemName || "this item"}" permanently?`
    );

    if (!confirmed) return;

    try {
      await apiClient.delete(`/admin/items/${item.id}`);
      setNotice("Item deleted successfully.");
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete item."
      );
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="admin-heading">
          <div>
            <p className="admin-eyebrow">CAMPUSFIND CONTROL CENTER</p>
            <h1>Admin Dashboard</h1>
            <p>Manage students and lost-and-found reports.</p>
          </div>

          <button
            className="admin-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </header>

        {error && <div className="admin-alert error">{error}</div>}
        {notice && <div className="admin-alert success">{notice}</div>}

        <section className="admin-stats">
          <article>
            <span>Registered Users</span>
            <strong>{stats.totalUsers ?? 0}</strong>
            <small>All accounts</small>
          </article>

          <article>
            <span>Total Reports</span>
            <strong>{stats.totalItems ?? 0}</strong>
            <small>Lost and found items</small>
          </article>

          <article>
            <span>Lost Items</span>
            <strong>{stats.lostItems ?? 0}</strong>
            <small>Reported missing</small>
          </article>

          <article>
            <span>Found Items</span>
            <strong>{stats.foundItems ?? 0}</strong>
            <small>Reported found</small>
          </article>

          <article>
            <span>Active Reports</span>
            <strong>{stats.activeItems ?? 0}</strong>
            <small>Awaiting resolution</small>
          </article>

          <article>
            <span>Returned Items</span>
            <strong>{stats.returnedItems ?? 0}</strong>
            <small>Marked returned</small>
          </article>
        </section>

        {loading ? (
          <div className="admin-loading">Loading dashboard data...</div>
        ) : (
          <>
            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">ACCOUNT MANAGEMENT</span>
                  <h2>Registered Users</h2>
                  <p>{visibleUsers.length} users found</p>
                </div>
              </div>

              <div className="admin-toolbar">
                <input
                  type="search"
                  placeholder="Search name, email or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((user) => (
                      <tr key={user.id}>
                        <td>#{user.id}</td>
                        <td>{user.fullName || "—"}</td>
                        <td>{user.email || "—"}</td>
                        <td>
                          <span
                            className={
                              String(user.role).toUpperCase() === "ADMIN"
                                ? "admin-badge admin"
                                : "admin-badge student"
                            }
                          >
                            {user.role || "STUDENT"}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}

                    {visibleUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="admin-empty">
                          No registered users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <p className="admin-note">
                Passwords and password hashes are never displayed.
              </p>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-eyebrow">REPORT MANAGEMENT</span>
                  <h2>Lost &amp; Found Items</h2>
                  <p>{visibleItems.length} reports found</p>
                </div>
              </div>

              <div className="admin-toolbar">
                <input
                  type="search"
                  placeholder="Search item, reporter or location..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Reporter</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.imageUrl ? (
                            <img
                              className="admin-item-image"
                              src={item.imageUrl}
                              alt=""
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{item.itemName || "—"}</td>
                        <td>{item.itemType || "—"}</td>
                        <td>{item.location || "—"}</td>
                        <td>{item.contactName || "—"}</td>
                        <td>{item.contactEmail || "—"}</td>
                        <td>
                          <select
                            className="admin-status"
                            value={item.status || "OPEN"}
                            onChange={(e) =>
                              updateStatus(item.id, e.target.value)
                            }
                          >
                            <option value="OPEN">Open</option>
                            <option value="RETURNED">Returned</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                        </td>
                        <td>{formatDate(item.createdAt)}</td>
                        <td>
                          <button
                            className="admin-delete"
                            onClick={() => deleteItem(item)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {visibleItems.length === 0 && (
                      <tr>
                        <td colSpan="9" className="admin-empty">
                          No item reports found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminDashboard;
