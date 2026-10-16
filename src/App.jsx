
import { useState } from "react";
import "./index.css";

const initialMedicines = [
  { id: 1, name: "Paracetamol 500mg", category: "Pain Relief", stock: 120, price: 2.5, expiry: "2027-08-15" },
  { id: 2, name: "Amoxicillin 500mg", category: "Antibiotic", stock: 45, price: 8, expiry: "2027-04-20" },
  { id: 3, name: "Cetirizine 10mg", category: "Allergy", stock: 8, price: 3.5, expiry: "2027-02-10" },
  { id: 4, name: "Vitamin C 500mg", category: "Vitamins", stock: 75, price: 5, expiry: "2027-11-30" },
  { id: 5, name: "Ibuprofen 200mg", category: "Pain Relief", stock: 4, price: 4.5, expiry: "2026-12-15" },
];

const emptyMedicine = {
  name: "",
  category: "",
  stock: "1",
  price: "",
  expiry: "",
};

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(
    window.location.hash === "#dashboard" &&
      sessionStorage.getItem("pharmacyUser")
      ? "Dashboard"
      : "Login"
  );

  const [medicines, setMedicines] = useState(initialMedicines);
  const [search, setSearch] = useState("");

  // Add New Medicine states
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [newMedicine, setNewMedicine] = useState(emptyMedicine);
  const [addMedicineError, setAddMedicineError] = useState("");
  const [addMedicineMessage, setAddMedicineMessage] = useState("");

  const [stockMedicine, setStockMedicine] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [stockAction, setStockAction] = useState("add");
  const [stockMessage, setStockMessage] = useState("");
  const [stockError, setStockError] = useState("");

  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [sales, setSales] = useState([]);
  const [saleMessage, setSaleMessage] = useState("");
  const [saleError, setSaleError] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  function handleLogin(e) {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    sessionStorage.setItem("pharmacyUser", username.trim());
    window.location.hash = "dashboard";
    setPage("Dashboard");
  }

  function logout() {
    sessionStorage.removeItem("pharmacyUser");
    window.location.hash = "";
    setPage("Login");
    setUsername("");
    setPassword("");
    setError("");
  }

  const goTo = (nextPage) => {
    setPage(nextPage);
    setStockMessage("");
    setStockError("");
    setSaleMessage("");
    setSaleError("");
    setAddMedicineError("");
    setAddMedicineMessage("");
  };

  const lowStock = medicines.filter(
    (medicine) => medicine.stock <= 10
  );

  const expiringMedicines = medicines.filter(
    (medicine) => medicine.expiry <= "2027-01-01"
  );

  const filteredMedicines = medicines.filter((medicine) =>
    `${medicine.name} ${medicine.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalUnits = medicines.reduce(
    (sum, medicine) => sum + medicine.stock,
    0
  );

  const inventoryValue = medicines.reduce(
    (sum, medicine) => sum + medicine.stock * medicine.price,
    0
  );

  const selectedProduct = medicines.find(
    (medicine) => medicine.id === Number(selectedMedicine)
  );

  const saleQuantity = Number(quantity);

  const saleTotal =
    selectedProduct &&
    Number.isInteger(saleQuantity) &&
    saleQuantity > 0
      ? selectedProduct.price * saleQuantity
      : 0;

  const peso = (amount) =>
    `₱${amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ADD NEW MEDICINE
  function handleAddMedicine(e) {
    e.preventDefault();

    setAddMedicineError("");
    setAddMedicineMessage("");

    const name = newMedicine.name.trim();
    const category = newMedicine.category.trim();
    const stock = Number(newMedicine.stock);
    const price = Number(newMedicine.price);

    if (
      !name ||
      !category ||
      newMedicine.stock === "" ||
      newMedicine.price === "" ||
      !newMedicine.expiry
    ) {
      setAddMedicineError("Please complete all fields.");
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 1 ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setAddMedicineError(
        "Quantity must be a positive whole number and price must be greater than zero."
      );
      return;
    }

    if (newMedicine.expiry < today) {
      setAddMedicineError(
        "Please enter an expiry date that is today or in the future."
      );
      return;
    }

    const duplicate = medicines.some(
      (medicine) =>
        medicine.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      setAddMedicineError(
        "This medicine already exists. Use Add Stock to update its quantity."
      );
      return;
    }

    const medicineToAdd = {
      id: Date.now(),
      name,
      category,
      stock,
      price,
      expiry: newMedicine.expiry,
    };

    setMedicines((current) => [...current, medicineToAdd]);

    setNewMedicine(emptyMedicine);
    setShowAddMedicine(false);
    setAddMedicineMessage(`${name} added successfully to inventory!`);
  }

  function adjustStock(e) {
    e.preventDefault();
    setStockMessage("");
    setStockError("");

    const product = medicines.find(
      (medicine) => medicine.id === Number(stockMedicine)
    );

    const amount = Number(stockQuantity);

    if (!product) {
      setStockError("Please select a medicine.");
      return;
    }

    if (!Number.isInteger(amount) || amount < 1) {
      setStockError("Enter a valid quantity of at least 1.");
      return;
    }

    if (stockAction === "remove" && amount > product.stock) {
      setStockError(`Only ${product.stock} unit(s) available.`);
      return;
    }

    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === product.id
          ? {
              ...medicine,
              stock:
                stockAction === "add"
                  ? medicine.stock + amount
                  : medicine.stock - amount,
            }
          : medicine
      )
    );

    setStockMessage(
      stockAction === "add"
        ? `${amount} unit(s) added to ${product.name}.`
        : `${amount} unit(s) removed from ${product.name}.`
    );

    setStockQuantity("1");
  }

  function completeSale(e) {
    e.preventDefault();
    setSaleMessage("");
    setSaleError("");

    const product = medicines.find(
      (medicine) => medicine.id === Number(selectedMedicine)
    );

    if (!product) {
      setSaleError("Please select a medicine.");
      return;
    }

    if (!Number.isInteger(saleQuantity) || saleQuantity < 1) {
      setSaleError("Enter a valid quantity of at least 1.");
      return;
    }

    if (saleQuantity > product.stock) {
      setSaleError(`Only ${product.stock} unit(s) available.`);
      return;
    }

    const transaction = {
      id: `TXN-${Date.now()}`,
      date: new Date().toLocaleString("en-PH"),
      medicine: product.name,
      quantity: saleQuantity,
      price: product.price,
      total: product.price * saleQuantity,
    };

    setMedicines((current) =>
      current.map((medicine) =>
        medicine.id === product.id
          ? { ...medicine, stock: medicine.stock - saleQuantity }
          : medicine
      )
    );

    setSales((current) => [transaction, ...current]);
    setSaleMessage("Sale completed successfully!");
    setSelectedMedicine("");
    setQuantity("1");
  }

  if (page === "Login") {
    return (
      <main className="login-page">
        <div className="login-card">
          <section className="brand-panel">
            <div className="brand-logo">✚</div>
            <h1>Pharmacy System</h1>
            <p className="brand-subtitle">
              Inventory &amp; Sales Management
            </p>

            <div className="brand-message">
              <span className="eyebrow">PHARMACY MANAGEMENT</span>
              <h2>
                Better inventory.
                <br />
                Better service.
              </h2>
              <p>
                Manage medicine stocks, monitor expiration dates, and
                organize sales records in one convenient workspace.
              </p>
            </div>

            <div className="brand-footer">
              ● Organized pharmacy operations
            </div>
          </section>

          <section className="form-panel">
            <div className="user-icon">♙</div>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-description">
              Sign in to access your pharmacy workspace.
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="show-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}

              <button className="sign-in-button" type="submit">
                Sign In →
              </button>
            </form>

            <div className="security-notice">
              <span>ℹ</span>
              <div>
                <strong>Prototype Demo</strong>
                <p>
                  Interactive demonstration for an HCI laboratory activity.
                </p>
              </div>
            </div>

            <p className="copyright">
              Pharmacy Inventory &amp; Sales Management System
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">✚</div>
          <div>
            <strong>Pharmacy System</strong>
            <small>Management Portal</small>
          </div>
        </div>

        <p className="nav-label">MAIN MENU</p>

        {[
          ["Dashboard", "▦"],
          ["Inventory", "▤"],
          ["Sales", "🛒"],
          ["Sales History", "◷"],
          ["Expiry", "⌛"],
          ["Reports", "▥"],
        ].map(([name, icon]) => (
          <button
            key={name}
            className={`nav-item ${page === name ? "active" : ""}`}
            onClick={() => goTo(name)}
          >
            <span>{icon}</span>
            {name === "Expiry" ? "Expiry Monitoring" : name}
          </button>
        ))}

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">
              {(sessionStorage.getItem("pharmacyUser") || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>
                {sessionStorage.getItem("pharmacyUser") || "User"}
              </strong>
              <small>Pharmacy Staff</small>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            ↪ Sign Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Pharmacy Management / {page}
            </p>
            <h1>{page === "Expiry" ? "Expiry Monitoring" : page}</h1>
          </div>

          <div className="topbar-date">
            {new Date().toLocaleDateString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </header>

        {page === "Dashboard" && (
          <>
            <section className="welcome-banner">
              <div>
                <p>OVERVIEW</p>
                <h2>Welcome to your workspace!</h2>
                <span>
                  Manage your medicine inventory and sales in one place.
                </span>
              </div>
              <div className="banner-icon">✚</div>
            </section>

            <section className="stats-grid">
              <article className="stat-card">
                <div className="stat-icon red">▤</div>
                <p>Total Medicine Types</p>
                <h2>{medicines.length}</h2>
                <small>Registered products</small>
              </article>

              <article className="stat-card">
                <div className="stat-icon pink">⚠</div>
                <p>Low Stock Alerts</p>
                <h2>{lowStock.length}</h2>
                <small>Medicines with 10 or fewer units</small>
              </article>

              <article className="stat-card">
                <div className="stat-icon gray">▣</div>
                <p>Total Units in Stock</p>
                <h2>{totalUnits}</h2>
                <small>Across listed products</small>
              </article>

              <article className="stat-card">
                <div className="stat-icon pale">₱</div>
                <p>Inventory Value</p>
                <h2>{peso(inventoryValue)}</h2>
                <small>Estimated stock value</small>
              </article>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Select a feature to continue.</p>
                </div>
              </div>

              <div className="dashboard-actions">
                <button
                  onClick={() => {
                    goTo("Inventory");
                    setShowAddMedicine(true);
                  }}
                >
                  <strong>＋ Add New Medicine</strong>
                  <span>Register a newly delivered medicine</span>
                </button>

                <button onClick={() => goTo("Sales")}>
                  <strong>🛒 New Sale</strong>
                  <span>Create a medicine transaction</span>
                </button>

                <button onClick={() => goTo("Expiry")}>
                  <strong>⌛ Check Expiry</strong>
                  <span>Review expiration dates</span>
                </button>

                <button onClick={() => goTo("Reports")}>
                  <strong>▥ View Reports</strong>
                  <span>Review inventory summaries</span>
                </button>
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Low Stock Alerts</h2>
                  <p>Review medicines that may need restocking.</p>
                </div>
                <button
                  className="outline-button"
                  onClick={() => goTo("Inventory")}
                >
                  View Inventory →
                </button>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((medicine) => (
                      <tr key={medicine.id}>
                        <td><strong>{medicine.name}</strong></td>
                        <td>{medicine.category}</td>
                        <td>{medicine.stock} units</td>
                        <td>
                          <span className="stock-badge">Low Stock</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {page === "Inventory" && (
          <>
            {/* ADD NEW MEDICINE */}
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Medicine Inventory</h2>
                  <p>Register newly delivered medicines in your pharmacy.</p>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setShowAddMedicine((current) => !current);
                    setAddMedicineError("");
                    setAddMedicineMessage("");
                  }}
                >
                  {showAddMedicine ? "Cancel" : "+ Add New Medicine"}
                </button>
              </div>

              {addMedicineMessage && (
                <p className="success-message" role="status">
                  {addMedicineMessage}
                </p>
              )}

              {showAddMedicine && (
                <form
                  className="add-medicine-form"
                  onSubmit={handleAddMedicine}
                >
                  <h3>Register New Medicine</h3>
                  <p className="muted">
                    Enter the details of the newly delivered medicine.
                  </p>

                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="newMedicineName">Medicine Name</label>
                      <input
                        id="newMedicineName"
                        type="text"
                        placeholder="e.g. Biogesic 500mg"
                        value={newMedicine.name}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newMedicineCategory">Category</label>
                      <select
                        id="newMedicineCategory"
                        value={newMedicine.category}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            category: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Pain Relief">Pain Relief</option>
                        <option value="Antibiotic">Antibiotic</option>
                        <option value="Allergy">Allergy</option>
                        <option value="Vitamins">Vitamins</option>
                        <option value="Cough and Cold">Cough and Cold</option>
                        <option value="Antacid">Antacid</option>
                        <option value="First Aid">First Aid</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="newMedicineStock">Initial Quantity</label>
                      <input
                        id="newMedicineStock"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Enter quantity"
                        value={newMedicine.stock}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            stock: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newMedicinePrice">Price per Unit (₱)</label>
                      <input
                        id="newMedicinePrice"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="e.g. 5.00"
                        value={newMedicine.price}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            price: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newMedicineExpiry">Expiry Date</label>
                      <input
                        id="newMedicineExpiry"
                        type="date"
                        min={today}
                        value={newMedicine.expiry}
                        onChange={(e) =>
                          setNewMedicine({
                            ...newMedicine,
                            expiry: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  {addMedicineError && (
                    <p className="error-message" role="alert">
                      {addMedicineError}
                    </p>
                  )}

                  <button type="submit" className="primary-button">
                    Save Medicine
                  </button>
                </form>
              )}
            </section>

            {/* STOCK MANAGEMENT */}
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Stock Management</h2>
                  <p>Add or remove quantities of registered medicines.</p>
                </div>
              </div>

              <form onSubmit={adjustStock} className="sale-form">
                <div className="form-group">
                  <label htmlFor="stockMedicine">Select Medicine</label>
                  <select
                    id="stockMedicine"
                    value={stockMedicine}
                    onChange={(e) => {
                      setStockMedicine(e.target.value);
                      setStockMessage("");
                      setStockError("");
                    }}
                    required
                  >
                    <option value="">Choose a medicine</option>
                    {medicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} · Current stock: {medicine.stock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock Action</label>
                  <div className="stock-action-buttons">
                    <button
                      type="button"
                      className={
                        stockAction === "add"
                          ? "primary-button"
                          : "outline-button"
                      }
                      onClick={() => {
                        setStockAction("add");
                        setStockMessage("");
                        setStockError("");
                      }}
                    >
                      + Add Stock
                    </button>

                    <button
                      type="button"
                      className={
                        stockAction === "remove"
                          ? "primary-button"
                          : "outline-button"
                      }
                      onClick={() => {
                        setStockAction("remove");
                        setStockMessage("");
                        setStockError("");
                      }}
                    >
                      − Remove Stock
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="stockQuantity">Quantity</label>
                  <input
                    id="stockQuantity"
                    type="number"
                    min="1"
                    step="1"
                    value={stockQuantity}
                    onChange={(e) => {
                      setStockQuantity(e.target.value);
                      setStockMessage("");
                      setStockError("");
                    }}
                    required
                  />
                </div>

                {stockError && (
                  <p className="error-message" role="alert">
                    {stockError}
                  </p>
                )}

                {stockMessage && (
                  <p className="success-message" role="status">
                    {stockMessage}
                  </p>
                )}

                <button className="primary-button" type="submit">
                  {stockAction === "add"
                    ? "+ Confirm Add Stock"
                    : "− Confirm Remove Stock"}
                </button>
              </form>
            </section>

            {/* ALL MEDICINES TABLE */}
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>All Medicines</h2>
                  <p>{medicines.length} registered medicine types.</p>
                </div>
              </div>

              <input
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicine or category..."
              />

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Unit Price</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((medicine) => (
                      <tr key={medicine.id}>
                        <td><strong>{medicine.name}</strong></td>
                        <td>{medicine.category}</td>
                        <td>{medicine.stock}</td>
                        <td>{peso(medicine.price)}</td>
                        <td>{medicine.expiry}</td>
                        <td>
                          <span
                            className={
                              medicine.stock === 0
                                ? "stock-badge"
                                : medicine.stock <= 10
                                ? "stock-badge"
                                : "normal-badge"
                            }
                          >
                            {medicine.stock === 0
                              ? "Out of Stock"
                              : medicine.stock <= 10
                              ? "Low Stock"
                              : "In Stock"}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {filteredMedicines.length === 0 && (
                      <tr>
                        <td colSpan="6">No matching medicines found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {page === "Sales" && (
          <section className="content-card">
            <h2>New Sale</h2>
            <p className="muted">
              Select a medicine and enter the quantity for this demo transaction.
            </p>

            <form onSubmit={completeSale} className="sale-form">
              <div className="form-group">
                <label htmlFor="medicine">Select Medicine</label>
                <select
                  id="medicine"
                  value={selectedMedicine}
                  onChange={(e) => {
                    setSelectedMedicine(e.target.value);
                    setSaleError("");
                    setSaleMessage("");
                  }}
                  required
                >
                  <option value="">Choose a medicine</option>
                  {medicines.map((medicine) => (
                    <option
                      key={medicine.id}
                      value={medicine.id}
                      disabled={medicine.stock < 1}
                    >
                      {medicine.name} · {medicine.stock} in stock ·{" "}
                      {peso(medicine.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  max={selectedProduct?.stock || undefined}
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    setSaleError("");
                    setSaleMessage("");
                  }}
                  required
                />
              </div>

              <div className="sale-total">
                <span>Transaction Total</span>
                <strong>{peso(saleTotal)}</strong>
              </div>

              {saleError && (
                <p className="error-message" role="alert">
                  {saleError}
                </p>
              )}

              {saleMessage && (
                <p className="success-message" role="status">
                  {saleMessage}
                </p>
              )}

              <button className="primary-button" type="submit">
                Confirm Sale
              </button>
            </form>
          </section>
        )}

        {page === "Sales History" && (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Sales History</h2>
                <p>Completed transactions in this demo session.</p>
              </div>
              <span className="normal-badge">
                {sales.length} transaction(s)
              </span>
            </div>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date &amp; Time</th>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id}>
                      <td><strong>{sale.id}</strong></td>
                      <td>{sale.date}</td>
                      <td>{sale.medicine}</td>
                      <td>{sale.quantity}</td>
                      <td>{peso(sale.price)}</td>
                      <td><strong>{peso(sale.total)}</strong></td>
                    </tr>
                  ))}

                  {sales.length === 0 && (
                    <tr>
                      <td colSpan="6">
                        No sales yet. Go to New Sale to record a transaction.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="report-row">
              <span>Total sales value</span>
              <strong>
                {peso(sales.reduce((sum, sale) => sum + sale.total, 0))}
              </strong>
            </div>
          </section>
        )}

        {page === "Expiry" && (
          <section className="content-card">
            <h2>Expiry Monitoring</h2>
            <p className="muted">
              Sample medicines expiring on or before January 1, 2027.
            </p>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Expiry Date</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringMedicines.map((medicine) => (
                    <tr key={medicine.id}>
                      <td>{medicine.name}</td>
                      <td>{medicine.expiry}</td>
                      <td>{medicine.stock}</td>
                    </tr>
                  ))}

                  {expiringMedicines.length === 0 && (
                    <tr>
                      <td colSpan="3">No matching records.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {page === "Reports" && (
          <section className="content-card">
            <h2>Inventory &amp; Sales Reports</h2>
            <p className="muted">
              Current inventory and sales summary.
            </p>

            <div className="report-row">
              <span>Medicine types</span>
              <strong>{medicines.length}</strong>
            </div>
            <div className="report-row">
              <span>Total units in stock</span>
              <strong>{totalUnits}</strong>
            </div>
            <div className="report-row">
              <span>Low-stock products</span>
              <strong>{lowStock.length}</strong>
            </div>
            <div className="report-row">
              <span>Estimated inventory value</span>
              <strong>{peso(inventoryValue)}</strong>
            </div>
            <div className="report-row">
              <span>Completed transactions</span>
              <strong>{sales.length}</strong>
            </div>
            <div className="report-row">
              <span>Total sales value</span>
              <strong>
                {peso(sales.reduce((sum, sale) => sum + sale.total, 0))}
              </strong>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
