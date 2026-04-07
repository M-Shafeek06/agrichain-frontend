import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

function VerifyProduce() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const verifiedRef = useRef(false); // 🔒 prevents double fetch

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleBack = () => {
    if (window.history.length > 2) navigate(-1);
    else {
      const role = localStorage.getItem("role");
      if (role === "FARMER") navigate("/farmer-dashboard");
      else if (role === "ADMIN") navigate("/admin-dashboard");
      else if (role === "RETAILER") navigate("/retailer-dashboard");
      else navigate("/");
    }
  };

  /* =====================================================
     🔍 READ-ONLY VERIFICATION FETCH
  ===================================================== */
  useEffect(() => {
    if (!batchId || verifiedRef.current) return;
    verifiedRef.current = true;

    const fetchVerification = async () => {
      try {
        const isAllocation = batchId.startsWith("INV-");

        const endpoint = isAllocation
          ? `/verify/allocation/${batchId}`
          : `/verify/${batchId}`;

        const res = await api.get(endpoint);

        if (isAllocation) {
          // 🔁 Merge allocation into full batch verification response
          setData({
            ...res.data,
            isAllocation: true,
            allocationDetails: res.data.allocation
          });
        } else {
          setData({
            ...res.data,
            isAllocation: false
          });
        }

      } catch (err) {
        console.error("Verification failed:", err);

        if (err.response?.status === 404) {
          setError("No product found in AgriChainTrust database.");
        } else {
          setError("Invalid or fake product.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [batchId]);

  /* ================= LOADING ================= */
  if (loading)
    return (
      <>
        <Navbar />
        <p style={{ padding: 40 }}>Verifying product authenticity...</p>
      </>
    );

  /* ================= ERROR ================= */
  if (error || !data)
    return (
      <>
        <Navbar />

        <div
          style={{
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
          }}
        >

          <p
            style={{
              color: "#b91c1c",
              fontSize: "18px",
              marginBottom: "20px"
            }}
          >
            {error}
          </p>

          <button
            onClick={handleBack}
            style={{
              padding: "10px 20px",
              background: "#2a794a",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ← Back
          </button>

        </div>
      </>
    );

  /* ================= SAFE DATA EXTRACTION ================= */
  const {
    productDetails = {},
    integrityScore = 0,
    integrityStatus = "UNVERIFIED",
    verificationStatus = "PENDING",
    adminRemark = "",
    tamperRisk = "UNKNOWN",
    aiTamperProbability = 0,
    confidenceLevel = "N/A",
    mlModelAccuracy = 0,
    supplyChainHistory = [],
    tamperedDetails = [],
    aiExplainability = {},
  } = data;

  const tamperedAtRole = data.tamperedAtRole || null;
  const tamperedAtId = data.tamperedAtId || null;

  /* =====================================================
     📦 BATCH LIFECYCLE SUMMARY (SAFE DERIVED VALUES)
     Works only for Master Batch verification
  ===================================================== */

  const totalProduced =
    productDetails.totalQuantity || productDetails.quantity || 0;

  const totalSold = productDetails.soldQuantity || 0;

  const remainingWarehouse =
    productDetails.remainingQuantity !== undefined
      ? productDetails.remainingQuantity
      : totalProduced - totalSold;

  const totalShipments =
    productDetails.shipmentCount || supplyChainHistory.length || 0;

  /* =====================================================
   🔎 FILTER SUPPLY HISTORY FOR CURRENT INVENTORY
   (MATCH CERTIFICATE SESSION LOGIC)
===================================================== */

  let filteredSupplyHistory = supplyChainHistory;

  if (data.isAllocation) {

    // find last distributor shipment creation
    const lastDistributorShipment = [...supplyChainHistory]
      .reverse()
      .find(e => e.status === "ASSIGNED_TO_TRANSPORTER");

    if (lastDistributorShipment?.shipmentSessionId) {

      const sessionId = lastDistributorShipment.shipmentSessionId;

      filteredSupplyHistory = supplyChainHistory.filter(
        e => e.shipmentSessionId === sessionId
      );

    }

  }

  /* =====================================================
     🔐 FINAL STATUS DERIVATION (CRITICAL FIX)
     - UI never trusts Produce blindly
     - If backend says TAMPERED → always TAMPERED
  ===================================================== */
  let finalStatus = "AUTHENTIC";

  if (verificationStatus === "REJECTED") {
    finalStatus = "ADMIN_REJECTED";
  } else if (integrityStatus === "TAMPERED" || integrityScore === 0) {
    finalStatus = "TAMPERED";
  }

  const isVerified = finalStatus === "AUTHENTIC";
  const isRejected = finalStatus === "ADMIN_REJECTED";
  const isTampered = finalStatus === "TAMPERED";

  /* 🔐 SAFE AI FIELDS (CRASH-PROOF) */
  const blockchainMatched =
    aiExplainability.blockchainHashMatched ?? null;

  const invalidBlocks =
    aiExplainability.invalidBlocks ?? 0;

  const geoAnomaly =
    aiExplainability.geoAnomaly ?? false;

  const avgTrust =
    aiExplainability.avgTrust ?? "N/A";

  const editCount =
    aiExplainability.editCount ?? 0;

  /* =====================================================
 🔎 HUMAN-READABLE TAMPER CAUSE
===================================================== */
  let tamperCause = data.explanation || "No tampering detected";

  if (isTampered) {

    /* 🔥 PRIORITY 1 — ALLOCATION */
    if (data.isAllocation && data.allocationTampered) {
      tamperCause = data.allocationReason;

      /* 🔥 PRIORITY 2 — PRODUCE */
    } else if (data.tamperReason) {
      tamperCause = data.tamperReason;

    } else if (aiExplainability.hashMismatch) {
      tamperCause = "Blockchain Genesis Hash Mismatch";

    } else if (aiExplainability.snapshotTampering) {
      tamperCause = "Batch Metadata Modified After Anchoring";

    } else if (aiExplainability.invalidBlocks > 0) {
      tamperCause = "Shipment Blockchain Chain Integrity Broken";

    } else if (aiExplainability.geoAnomaly) {
      tamperCause = "Abnormal Supply Chain Route Detected";

    } else if (aiExplainability.allocationTampering) {
      tamperCause = "Retail Inventory Allocation Record Manipulated";

    } else if (aiExplainability.saleLedgerTampering) {
      tamperCause = "Retail Sale Ledger Integrity Violation";

    } else {
      tamperCause = "Forensic Blockchain Integrity Violation Detected";
    }
  }

  /* =====================================================
     📄 CERTIFICATE DOWNLOAD (UNCHANGED)
  ===================================================== */
  const downloadCertificate = () => {
    window.open(
      `https://agrichain-backend-hbb9.onrender.com/api/certificate/download/${batchId}`,
      "_blank"
    );
  };

  const statusMap = {
    ASSIGNED_TO_TRANSPORTER: "Shipment Created by Distributor",
    PICKED_UP: "Transporter Picked Up Shipment",
    IN_TRANSIT: "Shipment In Transit",
    DELIVERED: "Shipment Delivered",
    AT_DISTRIBUTOR: "Returned to Distributor",
    AVAILABLE: "Available at Retail Store"
  };

  return (
    <>
      <Navbar />

      <div style={styles.pageWrapper}>
        <div style={styles.backRow}>
          <button style={styles.backBtn} onClick={handleBack}>
            ← Back
          </button>
        </div>

        {/* ===== STATUS CARD ===== */}
        <div style={styles.statusCard}>
          {finalStatus !== "AUTHENTIC" && (
            <div
              style={{
                ...styles.topTamperBox,
                border:
                  finalStatus === "ADMIN_REJECTED"
                    ? "1px solid #7f1d1d"
                    : "1px solid #dc2626",
                background:
                  finalStatus === "ADMIN_REJECTED"
                    ? "#fef2f2"
                    : "#fff"
              }}
            >
              <h4
                style={{
                  color:
                    finalStatus === "ADMIN_REJECTED"
                      ? "#7f1d1d"
                      : "#b91c1c",
                  marginBottom: 8
                }}
              >
                {finalStatus === "ADMIN_REJECTED"
                  ? "Admin Rejected"
                  : "Tamper Detected"}
              </h4>

              {/* 🔥 KEY DIFFERENCE */}
              {finalStatus === "ADMIN_REJECTED" ? (
                <p style={{ fontWeight: 600, fontSize: 13 }}>
                  Reason: {adminRemark || "Rejected by admin"}
                </p>
              ) : (
                <p style={{ fontWeight: 600, fontSize: 13 }}>
                  Cause: {tamperCause}
                </p>
              )}

              {/* only for tamper */}
              {finalStatus === "TAMPERED" && tamperedAtRole && tamperedAtId && (
                <p style={{ fontSize: 12, marginTop: 6 }}>
                  Responsible: <b>{tamperedAtRole}</b> ({tamperedAtId})
                </p>
              )}
            </div>
          )}
          <div style={styles.statusCenter}>

            {/* ===== STATUS TITLE ===== */}
            <h2
              style={{
                ...styles.status,
                color:
                  finalStatus === "AUTHENTIC"
                    ? "#14532d"
                    : finalStatus === "ADMIN_REJECTED"
                      ? "#7f1d1d"
                      : "#b91c1c",
              }}
            >
              {finalStatus === "AUTHENTIC"
                ? "AUTHENTIC PRODUCT"
                : finalStatus === "ADMIN_REJECTED"
                  ? "ADMIN REJECTED PRODUCT"
                  : "TAMPERED PRODUCT"}
            </h2>

            {/* ===== STATUS DESCRIPTION ===== */}
            <div style={{ fontSize: 13, marginTop: 5, textAlign: "center" }}>

              {finalStatus === "AUTHENTIC" && (
                <>
                  <p>This product is verified and safe for distribution.</p>

                  {verificationStatus === "REJECTED" && (
                    <p
                      style={{
                        marginTop: 6,
                        color: "#92400e",
                        fontWeight: 600
                      }}
                    >
                      ⚠️ Admin Decision: This batch is rejected for distribution.
                    </p>
                  )}
                </>
              )}

              {finalStatus === "TAMPERED" && (
                <p>Integrity violation detected in supply chain records.</p>
              )}

              {finalStatus === "ADMIN_REJECTED" && (
                <p>Rejected by authority due to quality or compliance failure.</p>
              )}

            </div>

            {/* ===== ADMIN AUTHORITY BADGE ===== */}
            {finalStatus === "ADMIN_REJECTED" && (
              <div
                style={{
                  marginTop: 8,
                  padding: "5px 12px",
                  background: "#7f1d1d",
                  color: "#fff",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  display: "inline-block"
                }}
              >
                VERIFIED BY ADMIN AUTHORITY
              </div>
            )}

            {/* ===== METRICS ===== */}
            <p style={styles.metric}>
              Integrity Score: <b>{integrityScore}%</b>
            </p>

            {/* ===== RISK BADGE ===== */}
            <p style={styles.metric}>
              Tamper Risk:{" "}
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  background:
                    tamperRisk === "LOW"
                      ? "#dcfce7"
                      : tamperRisk === "MEDIUM"
                        ? "#fef9c3"
                        : "#fee2e2",
                  color:
                    tamperRisk === "LOW"
                      ? "#166534"
                      : tamperRisk === "MEDIUM"
                        ? "#92400e"
                        : "#991b1b",
                  fontWeight: 600
                }}
              >
                {tamperRisk}
              </span>
            </p>
          </div>

          <button style={styles.downloadBtn} onClick={downloadCertificate}>
            ⬇ Download Certificate (PDF)
          </button>
        </div>

        {/* ===== GRID ===== */}
        <div style={styles.grid}>
          {/* PRODUCT */}
          {/* PRODUCT / ALLOCATION DETAILS */}
          <div style={styles.fixedCard}>
            <h3 style={styles.cardHeader}>
              {data.isAllocation ? "Retail Allocation Details" : "Product Details"}
            </h3>

            <hr style={styles.divider} />

            {data.isAllocation ? (
              <>
                <p><b>Inventory ID:</b> {data.allocationDetails.inventoryId}</p>
                <p><b>Retailer ID:</b> {data.allocationDetails.retailerId}</p>
                <p><b>Allocated Quantity:</b> {data.allocationDetails.quantity} kg</p>
                <p><b>Remaining Inventory:</b> {data.allocationDetails.remainingQuantity} kg</p>

                <hr />

                <p><b>Parent Batch:</b> {productDetails.batchId}</p>
                <p><b>Crop:</b> {productDetails.cropName}</p>
                <p><b>Farmer:</b> {productDetails.farmerName}</p>
              </>
            ) : (
              <>
                <p><b>Batch ID:</b> {productDetails.batchId}</p>
                <p><b>Farmer:</b> {productDetails.farmerName}</p>
                <p><b>Crop:</b> {productDetails.cropName}</p>
                <p><b>Total Batch Quantity:</b> {productDetails.quantity} kg</p>

                <p>
                  <b>Days Since Harvest:</b> {productDetails.daysSinceHarvest ?? "N/A"} days
                </p>

                <p>
                  <b>Freshness:</b>{" "}
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        productDetails.freshnessStatus === "FRESH"
                          ? "#166534"
                          : productDetails.freshnessStatus === "MODERATE"
                            ? "#92400e"
                            : "#b91c1c"
                    }}
                  >
                    {productDetails.freshnessStatus}
                  </span>
                </p>

                {productDetails.freshnessStatus === "OLD" && (
                  <p style={{ color: "#b91c1c", fontWeight: 600 }}>
                    ⚠️ Warning: Product is older than 45 days
                  </p>
                )}
              </>
            )}
          </div>

          {/* SUPPLY CHAIN */}
          <div style={styles.supplyBox}>
            <h3 style={styles.cardHeader}>Supply Chain History</h3>
            <hr style={styles.divider} />

            <div style={styles.supplyScroll}>
              {filteredSupplyHistory.length === 0 && !data.isAllocation ? (
                <p style={{ textAlign: "center", color: "#64748b" }}>
                  No supply chain activity recorded yet.
                </p>
              ) : (
                <>
                  {/* Shipment Session Events */}
                  {filteredSupplyHistory.map((s, i) => {
                    const formattedDate = s.createdAt
                      ? new Date(s.createdAt).toLocaleString()
                      : "N/A";

                    const statusLabel = statusMap[s.status] || s.status;

                    const statusColor =
                      s.status === "DELIVERED"
                        ? "#14532d"
                        : s.status === "IN_TRANSIT"
                          ? "#92400e"
                          : "#1e40af";

                    return (
                      <div
                        key={i}
                        style={{
                          ...styles.supplyCard,
                          borderLeft: `4px solid ${statusColor}`
                        }}
                      >
                        <p><b>Role:</b> {s.handlerRole || "Unknown"}</p>

                        <p><b>Handled By:</b> {s.handlerName || "N/A"}</p>

                        <p>
                          <b>Status:</b>{" "}
                          <span style={{ color: statusColor, fontWeight: 600 }}>
                            {statusLabel}
                          </span>
                        </p>

                        <p style={{ fontSize: 12, color: "#64748b" }}>
                          <b>Date:</b> {formattedDate}
                        </p>
                      </div>
                    );
                  })}
                  {verificationStatus === "REJECTED" && (
                    <div
                      style={{
                        ...styles.supplyCard,
                        borderLeft: "4px solid #7f1d1d",
                        background: "#fef2f2"
                      }}
                    >
                      <p><b>Role:</b> ADMIN</p>

                      <p>
                        <b>Status:</b>{" "}
                        <span style={{ color: "#7f1d1d", fontWeight: 600 }}>
                          Batch Rejected
                        </span>
                      </p>

                      <p><b>Remark:</b> {adminRemark || "No remark provided"}</p>

                      <p style={{ fontSize: 12, color: "#64748b" }}>
                        <b>Date:</b>{" "}
                        {data?.verifiedAt
                          ? new Date(data.verifiedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  )}

                  {/* Retail Inventory Creation Event */}
                  {data.isAllocation && data.allocationDetails && (
                    <div style={styles.supplyCard}>
                      <p><b>Role:</b> RETAILER</p>
                      <p><b>Handled By:</b> {data.allocationDetails.retailerId}</p>
                      <p><b>Status:</b> Available at Retail Store</p>
                      <p>
                        <b>Date:</b> {
                          data.allocationDetails?.updatedAt
                            ? new Date(data.allocationDetails.updatedAt).toLocaleString()
                            : data.allocationDetails?.createdAt
                              ? new Date(data.allocationDetails.createdAt).toLocaleString()
                              : "Retail inventory creation time recorded"
                        }
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* AI PANEL */}
          <div style={styles.fixedCard}>
            <h3 style={styles.cardHeader}>AI Risk Assessment</h3>
            <hr style={styles.divider} />

            {/* ===== CORE AI METRICS ===== */}
            <p>
              AI Tamper Probability:{" "}
              <b style={{
                color:
                  finalStatus === "AUTHENTIC"
                    ? "#14532d"
                    : finalStatus === "ADMIN_REJECTED"
                      ? "#7f1d1d"
                      : "#b91c1c"
              }}>
                {aiTamperProbability}%
              </b>
            </p>

            <p>
              Confidence Level:{" "}
              <b>
                {finalStatus === "ADMIN_REJECTED"
                  ? "ADMIN FINAL DECISION"
                  : finalStatus === "TAMPERED"
                    ? "BLOCKCHAIN OVERRIDE"
                    : confidenceLevel}
              </b>
            </p>

            <p>
              ML Model Accuracy:{" "}
              <b>
                {finalStatus === "ADMIN_REJECTED"
                  ? "Not Applicable (Admin Override)"
                  : `${mlModelAccuracy}%`}
              </b>
            </p>

            {/* ===== EXPLAINABILITY ===== */}
            <ul style={{ paddingLeft: 18, marginTop: 10 }}>

              <li>
                Blockchain Anchor:{" "}
                {blockchainMatched === null
                  ? "Not Available"
                  : blockchainMatched
                    ? "Verified"
                    : "Tampered"}
              </li>

              <li>
                Snapshot Integrity:{" "}
                {editCount > 0
                  ? "Modified After Anchoring"
                  : "No Unauthorized Changes"}
              </li>

              <li>
                Invalid Blocks:{" "}
                <b style={{ color: invalidBlocks === 0 ? "#14532d" : "#b91c1c" }}>
                  {invalidBlocks}
                </b>{" "}
                {invalidBlocks === 0
                  ? "(Chain Intact)"
                  : "(Integrity Broken)"}
              </li>

              <li>
                Geo Anomaly:{" "}
                {geoAnomaly ? "Detected" : "Not Detected"}
              </li>
              <li>
                Edit History Count: {editCount}
              </li>

            </ul>
          </div>
        </div>
      </div>
    </>
  );
}


/* ================= STYLES (UNCHANGED) ================= */
const styles = {
  pageWrapper: { position: "relative", padding: "80px 40px 40px" },
  backRow: { position: "absolute", top: 20, left: 30 },
  backBtn: {
    background: "none",
    border: "none",
    color: "#14532d",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  statusCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    padding: "25px 30px",
    borderRadius: 12,
    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
    marginBottom: 20,
    minHeight: 130,
    marginTop: "-10px"
  },
  topTamperBox: {
    border: "1px solid #dc2626",
    borderRadius: 8,
    padding: 10,
    width: 220,
    minHeight: 80,
  },
  statusCenter: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
  },
  status: { fontSize: 26, fontWeight: 800 },
  metric: { margin: 4 },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1.6fr 1fr",
    gap: 15,
  },
  fixedCard: {
    background: "#fff",
    padding: 18,
    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
    borderRadius: 12,
    height: 280,
    overflow: "hidden",
  },
  supplyBox: {
    background: "#fff",
    padding: 18,
    borderRadius: 12,
    height: 290,
    boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
  },
  supplyScroll: { maxHeight: 160, overflowY: "auto" },
  supplyCard: {
    background: "#f8fafc",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
  },
  tamperItem: { marginTop: 6, fontSize: 13 },
  cardHeader: { textAlign: "center", marginBottom: 10 },
  divider: {
    border: "none",
    borderTop: "1px solid #e2e8f0",
    marginBottom: 12,
  },
  downloadBtn: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: "translateY(-50%)",
    padding: "10px 15px",
    background: "#14532d",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default VerifyProduce;
