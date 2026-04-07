import { Routes, Route, Navigate } from "react-router-dom";

/* ================= PUBLIC PAGES ================= */
import Landing from "./pages/Landing";
import RoleSelector from "./pages/RoleSelector";
import VerifyProduce from "./pages/VerifyProduce";
import ConsumerScan from "./pages/ConsumerScan";

/* 🔥 BLOCKCHAIN READ-ONLY VIEW */
import BlockchainVerifyPage from "./pages/VerifyProduce";

/* ================= AUTH PAGES ================= */
import AuthGateway from "./pages/auth/AuthGateway";
import RegisterRole from "./pages/auth/RegisterRole";
import LoginRole from "./pages/auth/LoginRole";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/* ================= FARMER ================= */
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerForm from "./pages/FarmerForm";
import ProfileSettings from "./pages/ProfileSettings";
import Support from "./pages/Support";

/* ================= TRANSPORTER ================= */
import TransporterDashboard from "./pages/TransporterDashboard";
import TransporterProfileSettings from "./pages/TransporterProfileSettings";
import TransporterSupport from "./pages/TransporterSupport";
import MyTransportHistory from "./components/MyTransportHistory";
import UploadInvoice from "./pages/UploadInvoice";
import TransporterInvoiceHistory from "./pages/TransporterInvoiceHistory";
import TransporterAssignedShipments from "./pages/TransporterAssignedShipments";
import TransporterGuard from "./guards/TransporterGuard";

/* ================= DISTRIBUTOR ================= */
import DistributorDashboard from "./pages/Distributor/DistributorDashboard";
import IncomingShipments from "./pages/Distributor/IncomingShipments";
import Inventory from "./pages/Distributor/WarehouseInventory";
import Dispatch from "./pages/Distributor/Dispatch";
import DistributorSupport from "./pages/Distributor/DistributorSupport";
import DistributorProfile from "./pages/Distributor/DistributorProfile";
import DistributorRequests from "./pages/Distributor/DistributorRequests";
import DistributorInvoice from "./pages/Distributor/DistributorInvoice";
import DistributorInvoiceHistory from "./pages/Distributor/DistributorInvoiceHistory";
import WarehouseHistory from "./pages/Distributor/WarehouseHistory";

/* ================= RETAILER ================= */
import RetailerDashboard from "./pages/RetailerDashboard";
import RetailerUpdate from "./pages/RetailerUpdate";
import RetailerHistory from "./pages/RetailerHistory";
import RetailerVerify from "./pages/RetailerVerify";
import RetailerProfileSettings from "./pages/RetailerProfileSettings";
import RetailerSupport from "./pages/RetailerSupport";
import RetailerMarketplace from "./pages/RetailerMarketplace";
import RetailerRequests from "./pages/RetailerRequests";
import RetailWarehousePage from "./pages/RetailWarehousePage";
import RetailerSales from "./pages/RetailerSales";
import AllocationView from "./pages/AllocationView";
import RetailerGuard from "./guards/RetailerGuard";

/* ================= ADMIN ================= */
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import GasDashboard from "./pages/GasDashboard";
import AttackSimulation from "./pages/AttackSimulation";
import MLEvaluation from "./pages/MLEvaluation";
import AdminProfile from "./pages/AdminProfile";
import AdminSupport from "./pages/AdminSupport";
import AdminVerifyProduce from "./pages/AdminVerifyProduce";
import AdminVerifiedProduce from "./pages/AdminVerifiedProduce";
import AdminUsers from "./pages/AdminUsers";
import AdminActivityTimeline from "./pages/AdminActivityTimeline";

/* ================= ROUTE GUARD ================= */
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<Landing />} />
      <Route path="/scan" element={<ConsumerScan />} />
      <Route path="/produce/view/:batchId" element={<BlockchainVerifyPage />} />
      <Route path="/verify/:batchId" element={<VerifyProduce />} />

      {/* ================= AUTH ================= */}
      <Route path="/auth" element={<AuthGateway />} />
      <Route path="/select-role" element={<RoleSelector />} />
      <Route path="/roles" element={<Navigate to="/select-role" replace />} />
      <Route path="/register-role" element={<RegisterRole />} />
      <Route path="/login-role" element={<LoginRole />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ================= FARMER ================= */}
      <Route element={<ProtectedRoute allowedRoles={["FARMER"]} />}>
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/form" element={<FarmerForm />} />
        <Route path="/farmer/history" element={<FarmerDashboard />} />
        <Route path="/farmer/profile" element={<ProfileSettings />} />
        <Route path="/farmer/support" element={<Support />} />
      </Route>

      {/* ================= TRANSPORTER ================= */}
      <Route element={<ProtectedRoute allowedRoles={["TRANSPORTER"]} />}>

        <Route path="/transporter-dashboard"
          element={<TransporterGuard><TransporterDashboard /></TransporterGuard>}
        />

        <Route path="/transporter/shipments"
          element={<TransporterGuard><TransporterAssignedShipments /></TransporterGuard>}
        />

        <Route path="/transporter/history"
          element={<TransporterGuard><MyTransportHistory /></TransporterGuard>}
        />

        <Route path="/transporter/upload-invoice"
          element={<TransporterGuard><UploadInvoice /></TransporterGuard>}
        />

        <Route path="/transporter/invoice-history"
          element={<TransporterGuard><TransporterInvoiceHistory /></TransporterGuard>}
        />

        <Route path="/transporter/support"
          element={<TransporterGuard><TransporterSupport /></TransporterGuard>}
        />

        {/* Profile must NOT be guarded */}
        <Route path="/transporter/profile" element={<TransporterProfileSettings />} />

      </Route>

      {/* ================= DISTRIBUTOR ================= */}
      <Route element={<ProtectedRoute allowedRoles={["DISTRIBUTOR"]} />}>
        <Route path="/distributor/dashboard" element={<DistributorDashboard />} />
        <Route path="/distributor/incoming" element={<IncomingShipments />} />
        <Route path="/distributor/inventory" element={<Inventory />} />
        <Route path="/distributor/dispatch" element={<Dispatch />} />
        <Route path="/distributor/support" element={<DistributorSupport />} />
        <Route path="/distributor/profile" element={<DistributorProfile />} />
        <Route path="/distributor/requests" element={<DistributorRequests />} />
        <Route path="/distributor/invoice/:id" element={<DistributorInvoice />} />
        <Route path="/distributor/invoices" element={<DistributorInvoiceHistory />} />
        <Route path="/distributor/warehouse-history" element={<WarehouseHistory />} />
      </Route>

      {/* ================= RETAILER ================= */}
      <Route element={<ProtectedRoute allowedRoles={["RETAILER"]} />}>

        <Route path="/retailer-dashboard"
          element={<RetailerGuard><RetailerDashboard /></RetailerGuard>}
        />

        <Route path="/retailer/update"
          element={<RetailerGuard><RetailerUpdate /></RetailerGuard>}
        />

        <Route path="/retailer/history"
          element={<RetailerGuard><RetailerHistory /></RetailerGuard>}
        />

        <Route path="/retailer/verify"
          element={<RetailerGuard><RetailerVerify /></RetailerGuard>}
        />

        <Route path="/retailer/support"
          element={<RetailerGuard><RetailerSupport /></RetailerGuard>}
        />

        <Route path="/retailer/marketplace"
          element={<RetailerGuard><RetailerMarketplace /></RetailerGuard>}
        />

        <Route path="/retailer/requests"
          element={<RetailerGuard><RetailerRequests /></RetailerGuard>}
        />

        <Route path="/retailer/warehouse"
          element={<RetailerGuard><RetailWarehousePage /></RetailerGuard>}
        />

        <Route path="/retailer/sales"
          element={<RetailerGuard><RetailerSales /></RetailerGuard>}
        />

        <Route path="/produce/allocation/:inventoryId"
          element={<RetailerGuard><AllocationView /></RetailerGuard>}
        />

        {/* Profile must NOT be guarded */}
        <Route path="/retailer/profile" element={<RetailerProfileSettings />} />

      </Route>

      {/* ================= ADMIN ================= */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin-dashboard" element={<AnalyticsDashboard />} />
        <Route path="/admin/gas-analytics" element={<GasDashboard />} />
        <Route path="/admin/ml-evaluation" element={<MLEvaluation />} />
        <Route path="/admin/attack" element={<AttackSimulation />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/support" element={<AdminSupport />} />
        <Route path="/admin/verify-produce" element={<AdminVerifyProduce />} />
        <Route path="/admin/verified-produce" element={<AdminVerifiedProduce />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/activity" element={<AdminActivityTimeline />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;