// src/app/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import RegisterPage from "../features/auth/pages/RegisterPage.jsx";
import Layout from "../shared/components/Layout.jsx";
import DashboardGuard from "../shared/hooks/DashboardGuard.jsx";
import ProfilePage from "../features/auth/pages/ProfilePage.jsx";

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
            element: <div>Customers Page</div>,
          },
          {
            path: "/orders",
            element: <div>Orders Page</div>,
          },
          {
            path: "/debts",
            element: <div>Debts Page</div>,
          },
          {
            path: "/finances",
            element: <div>Finances Page</div>,
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
