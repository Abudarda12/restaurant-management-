import { Routes, Route } from "react-router-dom";
import Menu from "./pages/Menu";
import AdminLogin from "./admin/AdminLogin";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminDashboard from "./admin/AdminDashboard";
import AdminMenu from "./admin/AdminMenu";
import Cart from "./pages/Cart";
import AdminOrders from "./pages/AdminOrders";
import OrderStatus from "./pages/OrderStatus";
import Bill from "./pages/Bill";
import Feedback from "./pages/Feedback";
import AdminFeedback from "./admin/AdminFeedback";
import AdminUpdateMenu from "./admin/AdminUpdateMenu";

function App() {
  return (
    <Routes>
      {/* Customer */}
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/order/:id" element={<OrderStatus />} />
      <Route path="/bill/:id" element={<Bill />} />
      <Route path="/feedback" element={<Feedback />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute>
            <AdminMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute>
            <AdminFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/update/:id"
        element={
          <ProtectedRoute>
            <AdminUpdateMenu />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
