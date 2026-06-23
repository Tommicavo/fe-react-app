import { createBrowserRouter } from "react-router-dom";

import HomePage from "@/pages/HomePage/HomePage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import AdminPage from "@/pages/AdminPage/AdminPage";
import SettingPage from "@/pages/SettingPage/SettingPage";
import DetailPage from "@/pages/DetailPage/DetailPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/setting",
    element: <SettingPage />,
  },
  {
    path: "/detail/:id",
    element: <DetailPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
