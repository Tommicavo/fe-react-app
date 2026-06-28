import { createBrowserRouter } from "react-router-dom";

import App from "@/components/App/App";
import LoginPage from "@/pages/LoginPage/LoginPage";
import HomePage from "@/pages/HomePage/HomePage";
import AdminPage from "@/pages/AdminPage/AdminPage";
import SettingPage from "@/pages/SettingPage/SettingPage";
import AiModelDetailPage from "@/pages/AiModelDetailPage/AiModelDetailPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "setting", element: <SettingPage /> },
      { path: "models/new", element: <AiModelDetailPage /> },
      { path: "models/:id", element: <AiModelDetailPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
