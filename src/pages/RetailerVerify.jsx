import { useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";

import RetailerLayout from "../layouts/RetailerLayout";
import PageWrapper from "../components/PageWrapper";

export default function RetailerVerify() {

    const navigate = useNavigate();
    const [inventoryId, setInventoryId] = useState("");
    const [error, setError] = useState("");
    const [hover, setHover] = useState(false);

    /* ===============================
       MANUAL VERIFY (UNCHANGED LOGIC)
    ================================ */
    const handleVerify = () => {
        const id = inventoryId.trim();

        if (!id) {
            setError("Please enter a valid Inventory ID or scan QR.");
            return;
        }

        // Optional validation (recommended)
        if (!id.startsWith("INV-")) {
            setError("Invalid Inventory ID format.");
            return;
        }

        setError("");

        navigate(`/verify/${id}?mode=manual`);
    };

    /* ===============================
       QR UPLOAD HANDLER (NEW LOGIC)
    ================================ */
    const handleQRUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const code = jsQR(
                    imageData.data,
                    canvas.width,
                    canvas.height
                );

                if (!code) {
                    setError("QR code could not be read.");
                    return;
                }

                const qrText = code.data;

                try {
                    const url = new URL(qrText);
                    const id = url.pathname.split("/").pop();
                    setError("");
                    navigate(`/verify/${id}?mode=qr`);
                } catch {
                    setError("Invalid QR code format.");
                }
            };
        };

        reader.readAsDataURL(file);
    };

    /* ===============================
       STYLES (UNCHANGED)
    ================================ */

    const container = {
        height: "calc(100vh - 700px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 25
    };

    const card = {
        width: 600,
        background: "#fff",
        padding: "42px 48px",
        borderRadius: 20,
        boxShadow: "0 16px 38px rgba(0,0,0,0.15)",
        textAlign: "center"
    };

    const subtitle = {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 20
    };

    const input = {
        width: "75%",
        padding: 12,
        borderRadius: 8,
        border: "1px solid #cbd5e1",
        marginBottom: 14,
        outline: "none"
    };

    const divider = {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 10
    };

    const errorText = {
        marginTop: 10,
        color: "#dc2626",
        fontSize: 13
    };

    const uploadBtn = {
        padding: "8px 18px",
        border: "1.5px dashed #14532d",
        borderRadius: 8,
        color: "#14532d",
        cursor: "pointer",
        fontWeight: 600,
        display: "inline-block"
    };

    const verifyBtn = {
        padding: "10px 22px",
        background: hover ? "#14532d" : "#fff",
        color: hover ? "#fff" : "#14532d",
        border: "2px solid #14532d",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.25s ease"
    };

    return (
        <RetailerLayout activeTab="verify">
            <PageWrapper>
                <div style={container}>
                    <div style={card}>

                        <h2>Verify Product Authenticity</h2>
                        <p style={subtitle}>
                            Enter Inventory ID manually or upload QR from produce pack.
                        </p>

                        <input
                            style={input}
                            placeholder="Enter Inventory ID"
                            value={inventoryId}
                            onChange={(e) => setInventoryId(e.target.value)}
                        />

                        <div style={divider}>OR</div>

                        <div style={{ marginTop: 22 }}>

                            <div style={{ marginBottom: 14 }}>
                                <label style={uploadBtn}>
                                    📷 Upload QR Image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        hidden
                                        onChange={handleQRUpload}
                                    />
                                </label>
                            </div>

                            <button
                                style={verifyBtn}
                                onMouseEnter={() => setHover(true)}
                                onMouseLeave={() => setHover(false)}
                                onClick={handleVerify}
                            >
                                Verify Product Authenticity
                            </button>

                        </div>

                        {error && <p style={errorText}>{error}</p>}

                    </div>
                </div>
            </PageWrapper>
        </RetailerLayout>
    );
}