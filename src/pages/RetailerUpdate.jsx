import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PageWrapper from "../components/PageWrapper";
import RetailerLayout from "../layouts/RetailerLayout";

/* ===== Relative Time ===== */
const timeAgo = (date) => {
  if (!date) return "";
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
};

export default function RetailerUpdate() {

  const navigate = useNavigate();
  const roleId = localStorage.getItem("roleId");
  const roleName = localStorage.getItem("roleName");

  const [searchTerm, setSearchTerm] = useState("");
  /* ================= STATE ================= */

  const [inventoryList, setInventoryList] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [sellQty, setSellQty] = useState("");
  const [selling, setSelling] = useState(false);
  const [recent, setRecent] = useState([]);

  const [successMsg, setSuccessMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  /* ================= LOAD DATA ================= */

  const loadRecent = async () => {
    try {
      const res = await api.get(`/inventory/recent-sales/${roleId}`);
      setRecent(res.data || []);
    } catch {
      setRecent([]);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await api.get("/inventory", {
        headers: { "x-retailer-id": roleId }
      });
      setInventoryList(res.data || []);
    } catch {
      setInventoryList([]);
    }
  };

  useEffect(() => {
    if (!roleId || !roleName) {
      navigate("/auth");
      return;
    }

    loadRecent();
    loadInventory();

    // 🔥 Auto refresh every 5 seconds
    const interval = setInterval(() => {
      loadRecent();
    }, 5000);

    return () => clearInterval(interval);

  }, [navigate, roleId, roleName]);


  /* ================= SELL FROM INVENTORY ================= */

  const handleSell = async () => {

    if (!selectedInventory) return;

    const qty = Number(sellQty);

    const calculatedSale =
      selectedInventory && sellQty
        ? (
          selectedInventory.retailerPerKgPrice *
          1.04 *
          Number(sellQty)
        ).toFixed(2)
        : null;

    if (!qty || qty <= 0) return;

    if (qty > selectedInventory.remainingQuantity) {
      alert("Cannot sell more than available stock");
      return;
    }

    try {
      setSelling(true);

      await api.post(
        "/inventory/sell",
        {
          inventoryId: selectedInventory.inventoryId,
          quantitySold: qty
        },
        {
          headers: {
            "x-retailer-id": roleId
          }
        }
      );

      // Refresh inventory
      const res = await api.get("/inventory", {
        headers: { "x-retailer-id": roleId }
      });

      const updatedList = res.data || [];
      setInventoryList(updatedList);

      const updated = updatedList.find(
        i => i.inventoryId === selectedInventory.inventoryId
      );

      setSelectedInventory(null);
      setSellQty("");

      setSuccessMsg(`Sale successful: ${qty} kg sold from ${selectedInventory.cropName}.`);
      setTimeout(() => setSuccessMsg(""), 3000);

    } catch (err) {
      console.error("Sale error:", err.response?.data || err.message);
      alert(err.response?.data?.error || "Sale failed");
    } finally {
      setSelling(false);
    }
  };


  const filteredInventory = inventoryList
    .filter(inv =>
      inv.integrityStatus !== "TAMPERED" &&
      (
        inv.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.inventoryId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  /* ================= RENDER ================= */

  return (
    <RetailerLayout activeTab="update">
      <PageWrapper>

        <div style={styles.wrapper}>

          {/* ================= CARD 1 ================= */}
          <div style={styles.card}>
            <h2 style={styles.heading}>Sell From Inventory</h2>
            <p style={styles.subheading}>
              Inventory is automatically updated after transporter verification
            </p>
            {successMsg && (
              <div style={styles.successBox}>
                ✔ {successMsg}
              </div>
            )}

            <input
              type="text"
              placeholder="Search crop ... / INV ID ...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />

            <div style={styles.dropdownBox}>
              {filteredInventory.length === 0 ? (
                <div style={styles.noResult}>No inventory found</div>
              ) : (
                filteredInventory.map(inv => (
                  <div
                    key={inv.inventoryId}
                    style={styles.dropdownItem}
                    onClick={() => {
                      setSelectedInventory(inv);
                      setSellQty("");
                    }}
                  >
                    <b>{inv.cropName}</b> — {inv.remainingQuantity} kg
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      ID: {inv.inventoryId}
                    </div>
                    <div style={styles.dateText}>
                      Received: {new Date(inv.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ===== STOCK PANEL (Always Visible) ===== */}

            <div style={styles.inventoryBox}>

              {!selectedInventory ? (
                <>
                  <div style={styles.placeholderBox}>
                    <span style={styles.placeholderText}>
                      Select a crop to record sale
                    </span>
                  </div>

                  <p style={styles.helperText}>
                    Select an inventory above to view stock details and record sales.
                  </p>
                </>
              ) : (
                <>
                  <div style={styles.stockHeader}>
                    <span>
                      {selectedInventory.cropName} Stock
                    </span>
                    <span style={styles.stockValue}>
                      {selectedInventory.remainingQuantity} kg
                    </span>
                  </div>

                  <div style={styles.sellRow}>
                    <input
                      type="text"
                      placeholder="Enter quantity to sell (kg)"
                      value={sellQty}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow max 3 digits before decimal and 3 after
                        const regex = /^\d{0,3}(\.\d{0,3})?$/;

                        if (regex.test(value) || value === "") {
                          if (Number(value) <= 999.999 || value === "") {
                            setSellQty(value);
                          }
                        }
                      }}
                      style={{ ...styles.input, flex: 1 }}
                    />

                    <button
                      type="button"
                      disabled={
                        selling ||
                        !sellQty ||
                        Number(sellQty) <= 0
                      }
                      onClick={() => setShowConfirm(true)}
                      style={styles.primaryBtn}
                    >
                      {selling ? "Recording..." : "Record Sale"}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

          {showConfirm && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalBox}>
                <h3 style={{ marginBottom: 10 }}>Confirm Sale</h3>

                <p style={{ fontSize: 14 }}>
                  Are you sure you want to sell{" "}
                  <b>{sellQty} kg</b> of{" "}
                  <b>{selectedInventory?.cropName}</b>?
                </p>

                <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      setShowConfirm(false);
                      await handleSell();
                    }}
                    style={styles.confirmBtn}
                  >
                    Yes, Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* ================= CARD 2 ================= */}
          <div style={styles.card}>
            <h2 style={styles.heading}>Recent Retail Activity</h2>

            {recent.length === 0 && (
              <p style={styles.subheading}>No recent sales recorded</p>
            )}

            {recent.slice(0, 3).map((sale) => (
              <div key={sale._id} style={styles.recentRow}>
                <div>
                  <div style={styles.batchId}>{sale.batchId}</div>

                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {sale.cropName || "Unknown Crop"}
                  </div>

                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Inv ID: {sale.inventoryId}
                  </div>
                  <div style={styles.subInfo}>
                    Sold: {sale.quantitySold} kg
                  </div>
                  <div style={styles.subInfo}>
                    Remaining: {sale.remainingAfterSale} kg
                  </div>
                  <div style={styles.subInfo}>
                    {timeAgo(sale.createdAt)}
                  </div>
                </div>

                <div style={styles.saleBadge}>
                  SOLD
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageWrapper>
    </RetailerLayout>
  );
}

/* ================= STYLES ================= */

const styles = {

  wrapper: {
    maxWidth: 1100,
    margin: "0 auto",
    marginTop: -60,   // 🔥 move upward
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 30
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "20px 30px",   // 🔥 reduce top padding
    display: "flex",
    flexDirection: "column",
    gap: 12                // 🔥 tighter internal spacing
  },

  heading: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4
  },

  subheading: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1"
  },

  successBox: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "10px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600
  },

  primaryBtn: {
    padding: "10px 24px",
    borderRadius: 20,
    border: "none",
    background: "#14532d",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer"
  },

  saleBadge: {
    background: "#dcfce7",
    color: "#166534",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 20,
    height: "fit-content"
  },

  inventoryBox: {
    marginTop: 16,
    padding: 20,
    background: "#f8fafc",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
  },

  modalBox: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 320,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
  },

  cancelBtn: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#f1f5f9",
    cursor: "pointer"
  },

  confirmBtn: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    background: "#14532d",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600
  },

  dropdownBox: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    maxHeight: 150,
    overflowY: "auto",
    scrollBehavior: "smooth"
  },

  dropdownItem: {
    padding: 10,
    cursor: "pointer",
    borderBottom: "1px solid #e5e7eb"
  },

  noResult: {
    padding: 10,
    fontSize: 13,
    color: "#64748b"
  },

  dateText: {
    fontSize: 11,
    color: "#94a3b8"
  },

  placeholderBox: {
    padding: 18,
    borderRadius: 10,
    background: "#f1f5f9",
    border: "1px dashed #cbd5e1",
    textAlign: "center"
  },

  placeholderText: {
    fontSize: 13,
    color: "#64748b"
  },

  helperText: {
    fontSize: 12,
    color: "#94a3b8"
  },

  stockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600,
    fontSize: 14
  },

  stockValue: {
    color: "#166534",
    fontWeight: 700
  },

  sellRow: {
    display: "flex",
    gap: 12
  },

  recentRow: {
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb"
  },

  batchId: {
    fontWeight: 700,
    fontSize: 13
  },

  subInfo: {
    fontSize: 12,
    color: "#64748b"
  },

  progressLine: {
    height: 6,
    background: "#e5e7eb",
    borderRadius: 6,
    marginTop: 6,
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    background: "#16a34a"
  }
};
