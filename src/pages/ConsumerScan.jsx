import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function ConsumerScan() {

  const navigate = useNavigate();
  const qrRef = useRef(null);
  const [scannerRunning, setScannerRunning] = useState(false);

  /* ================= STOP CAMERA ================= */

  const stopScanner = async () => {

    if (!qrRef.current) return;

    try {
      await qrRef.current.stop();
      await qrRef.current.clear();
    } catch (err) {
      console.warn("Scanner stop error:", err);
    }

    qrRef.current = null;
    setScannerRunning(false);
  };


  /* ================= START CAMERA ================= */

  const startScanner = async () => {

    if (scannerRunning) return;

    const scanner = new Html5Qrcode("qr-reader");
    qrRef.current = scanner;

    try {

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },

        async (decodedText) => {

          const batchId = decodedText.split("/").pop();

          await stopScanner();   // IMPORTANT: stop camera first

          navigate(`/verify/${batchId}`);
        },

        () => { }
      );

      setScannerRunning(true);

    } catch (err) {
      console.error("QR start error:", err);
    }
  };


  /* ================= BACK BUTTON ================= */

  const handleBack = async () => {

    await stopScanner();

    navigate("/auth"); // safer than navigate(-1)
  };


  /* ================= IMAGE QR SCAN ================= */

  const handleFileScan = async (event) => {

    const file = event.target.files[0];
    if (!file) return;

    try {

      const qr = new Html5Qrcode("qr-reader");

      const decodedText = await qr.scanFile(file, true);

      const batchId = decodedText.split("/").pop();

      navigate(`/verify/${batchId}`);

    } catch {
      alert("QR code not detected in image.");
    }
  };


  /* ================= CLEANUP ================= */

  useEffect(() => {

    return () => {
      stopScanner();
    };

  }, []);


  return (
    <>
      <Navbar />

      <div style={styles.container}>

        {/* BACK BUTTON */}
        <div style={styles.backRow}>
          <button style={styles.backBtn} onClick={handleBack}>
            ← Back
          </button>
        </div>

        {/* SCANNER CARD */}
        <div style={styles.centerContainer}>
          <div style={styles.scanCard}>

            <h2 style={styles.title}>Scan Product QR</h2>

            <p style={styles.subtitle}>
              Align the QR code within the frame to verify product authenticity
            </p>

            <div style={styles.scannerWrapper}>

              {!scannerRunning && (
                <div style={styles.placeholder}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=SCAN"
                    alt="QR Reference"
                    style={styles.qrImage}
                  />
                  <p style={styles.scanHint}>Tap "Start Scan" to open camera</p>
                </div>
              )}

              <div id="qr-reader" style={styles.scanner}></div>

            </div>

            {/* START SCAN BUTTON */}
            {!scannerRunning && (
              <button style={styles.startBtn} onClick={startScanner}>
                Start Scan
              </button>
            )}

            {/* UPLOAD IMAGE */}
            <div style={{ marginTop: "14px" }}>
              <label style={styles.uploadBtn}>
                Upload QR Image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileScan}
                />
              </label>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}


const styles = {

  container: {
    position: "fixed",
    top: "86px",
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(#f8fafc, #eef2f7)"
  },

  backRow: {
    position: "absolute",
    top: "24px",
    left: "48px"
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#14532d",
    fontSize: "14px",
    fontWeight: "550",
    cursor: "pointer"
  },

  centerContainer: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  scanCard: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "28px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
    textAlign: "center",
    width: "100%",
    maxWidth: "520px"
  },

  title: {
    fontSize: "22px",
    marginBottom: "6px",
    color: "#0f172a"
  },

  qrImage: {
    width: "55px",
    height: "55px",
    marginBottom: "10px",
    opacity: 0.8
  },

  subtitle: {
    fontSize: "14px",
    color: "#475569",
    marginBottom: "16px"
  },

  scannerWrapper: {
    position: "relative",
    width: "280px",
    height: "210px",
    margin: "0 auto"
  },

  scanner: {
    width: "100%",
    height: "100%",
    border: "3px solid #22c55e",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#f8fafc"
  },

  placeholder: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    color: "#166534"
  },

  qrIcon: {
    fontSize: "48px",
    marginBottom: "10px",
    opacity: 0.6
  },

  scanHint: {
    fontSize: "14px",
    color: "#475569"
  },

  startBtn: {
    marginTop: "15px",
    padding: "10px 20px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  uploadBtn: {
    display: "inline-block",
    padding: "9px 18px",
    background: "#22c55e",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer"
  }

};

export default ConsumerScan;