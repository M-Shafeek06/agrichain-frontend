import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Fuse from "fuse.js";
import { cropOptions } from "../data/cropOptions";

/* ================= BATCH LIMIT ================= */

const MAX_BATCH_KG = 1000;

export default function ProduceForm({
  setCreatedBatch,
  onSubmitSuccess,
  resetForm
}) {
  const roleId = localStorage.getItem("roleId");
  const roleName = localStorage.getItem("roleName");

  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    harvestDate: "",
    qualityGrade: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===== SEARCHABLE DROPDOWN ===== */

  const [searchText, setSearchText] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const fuse = new Fuse(cropOptions, {
    threshold: 0.3,
    keys: [
      "english",
      "tamil",
      "malayalam",
      "tamilRoman",
      "malayalamRoman"
    ]
  });

  const filteredCrops =
    searchText.trim() === ""
      ? cropOptions
      : fuse.search(searchText).map((result) => result.item);

  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  /* ================= DATE LIMITS ================= */

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDateObj = new Date(today);
  minDateObj.setDate(minDateObj.getDate() - 3);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minHarvestDate = formatLocalDate(minDateObj);
  const maxHarvestDate = formatLocalDate(today);

  const isDateAllowed = (value) => {
    const [year, month, day] = value.split("-");
    const selected = new Date(year, month - 1, day);
    selected.setHours(0, 0, 0, 0);
    return selected >= minDateObj && selected <= today;
  };

  /* ================= RESET ================= */

  useEffect(() => {
    if (!resetForm) return;

    setFormData({
      cropName: "",
      quantity: "",
      harvestDate: "",
      qualityGrade: ""
    });

    setSearchText("");
    setError("");
  }, [resetForm]);

  /* ================= INPUT ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ QUANTITY FIX (no freeze)
    if (name === "quantity") {
      const qty = Number(value);

      setFormData({ ...formData, quantity: value });

      if (qty < 100 || qty > 1000) {
        setError("Quantity must be between 100 kg and 1000 kg.");
      } else {
        setError("");
      }

      return;
    }

    // ✅ DATE VALIDATION
    if (name === "harvestDate" && value && !isDateAllowed(value)) {
      setError(
        "Harvest date must be within the last 3 days and cannot be a future date."
      );
      setFormData({ ...formData, harvestDate: "" });
      return;
    }

    setError("");
    setFormData({ ...formData, [name]: value });
  };
  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cropName) {
      setError("Please select a crop from the dropdown.");
      return;
    }

    // ✅ FINAL QUANTITY CHECK
    const qty = Number(formData.quantity);
    if (qty < 100 || qty > 1000) {
      setError("Quantity must be between 100 kg and 1000 kg.");
      return;
    }

    if (!isDateAllowed(formData.harvestDate)) {
      setError(
        "Harvest date must be within the last 3 days and cannot be a future date."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/produce/create", {
        farmerId: roleId,
        farmerName: roleName,
        cropName: formData.cropName,
        quantity: qty,
        qualityGrade: formData.qualityGrade,
        harvestDate: formData.harvestDate
      });

      setCreatedBatch?.({
        batchId: res.data.batchId,
        qrCode: res.data.qrCode
      });

      onSubmitSuccess?.();

    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      <style>{`
        .produce-title {
          font-size:22px;
          font-weight:700;
          margin-bottom:6px;
        }

        .produce-sub {
          font-size:13px;
          color:#64748b;
          margin-bottom:18px;
        }

        .produce-form {
          display:flex;
          flex-direction:column;
          gap:14px;
        }

        .produce-input {
  width: 100%;
  box-sizing: border-box;
  padding: 11px 13px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
}

        .dropdown-wrap {
  position: relative;
  width: 100%;
}
        .dropdown {
          position:absolute;
          top:105%;
          left:0;
          width:100%;
          background:white;
          border:1px solid #cbd5e1;
          border-radius:6px;
          max-height:200px;
          overflow-y:auto;
          box-shadow:0 6px 16px rgba(0,0,0,0.12);
          z-index:100;
        }

        .produce-card {
        position: relative;
        background: linear-gradient(145deg, #ffffff, #f0fdf4);
        border: 1px solid #e5e7eb;
        border-top: 6px solid #166534;
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        transition: 0.3s ease;
      }

      .produce-card:hover {
        box-shadow: 0 14px 30px rgba(0,0,0,0.08);
      }
        .dropdown-item {
          padding:9px 12px;
          cursor:pointer;
          font-size:14px;
        }

        .dropdown-item:hover {
          background:#f1f5f9;
        }

        .produce-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: linear-gradient(135deg, #166534, #22c55e);
  color: white;

  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;

  transition: all 0.3s ease;
  margin-top: 12px;

  width: auto;          /* important */
  align-self: center;   /* centers button inside form */
}

.produce-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(22,101,52,0.25);
}

        .produce-error {
          color:#b91c1c;
          text-align:center;
          font-size:14px;
        }
      `}</style>

      <div className="produce-title">
        🌱  Farmer Produce Registration
      </div>

      <div className="produce-sub">
        <p style={{ color: "#6b7280" }}>
          Enter crop details to initiate blockchain-based traceability
        </p>
      </div>

      <form className="produce-form" onSubmit={handleSubmit}>

        <input
          className="produce-input"
          value={roleName}
          readOnly
        />

        {/* SEARCHABLE DROPDOWN */}

        <div className="dropdown-wrap" ref={dropdownRef}>
          <input
            className="produce-input"
            placeholder="Search Crop (English / Tamil / Malayalam)..."
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            required
          />

          {showDropdown && (
            <div className="dropdown">
              {filteredCrops.length > 0 ? (
                filteredCrops.map((crop) => (
                  <div
                    key={crop.english}
                    className="dropdown-item"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        cropName: crop.english
                      });

                      setSearchText(
                        `${crop.english} / ${crop.tamil} / ${crop.malayalam}`
                      );

                      setShowDropdown(false);
                    }}
                  >
                    {crop.english} / {crop.tamil} / {crop.malayalam}
                  </div>
                ))
              ) : (
                <div className="dropdown-item">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        <input
          className="produce-input"
          type="number"
          name="quantity"
          placeholder="Quantity (kg) — 100 to 1000 kg"
          value={formData.quantity}
          onChange={handleChange}
          min="100"
          max="1000"
          required
        />

        <input
          className="produce-input"
          type="date"
          name="harvestDate"
          value={formData.harvestDate}
          onChange={handleChange}
          min={minHarvestDate}
          max={maxHarvestDate}
          required
        />

        <select
          className="produce-input"
          name="qualityGrade"
          value={formData.qualityGrade}
          onChange={handleChange}
          required
        >
          <option value="">Select Quality Grade</option>
          <option value="A">Grade A</option>
          <option value="B">Grade B</option>
          <option value="C">Grade C</option>
        </select>

        {error && (
          <p className="produce-error">{error}</p>
        )}

        <button
          className="produce-submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Produce Data"}
        </button>

      </form>
    </>
  );
}
