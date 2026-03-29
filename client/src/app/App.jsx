// src/app/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import Layout from "../shared/components/Layout.jsx";
import DashboardGuard from "../shared/hooks/DashboardGuard.jsx";
import ProfilePage from "../features/auth/pages/ProfilePage.jsx";
import PersonsPage from "../features/people/pages/PersonPage.jsx";
import ProductPage from "../features/products/pages/ProductPage.jsx";
import POSPage from "../features/orders/pages/PosPage.jsx";
import OrdersPage from "../features/orders/pages/OrdersPage.jsx";
import FinancialPage from "../features/financials/pages/FinancialPage.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <DashboardGuard />,
    children: [
      {
        element: <Layout />, // 👈 shared layout
        children: [
          {
            path: "/",
            element: <div>Dashboard</div>,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/customers",
            element: <PersonsPage />,
          },
          {
            path: "/orders",
            element: <OrdersPage />,
          },
          {
            path: "/pos",
            element: <POSPage />,
          },
          {
            path: "/products",
            element: <ProductPage />,
          },
          {
            path: "/finances",
            element: <FinancialPage />,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
