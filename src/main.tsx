import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./styles/global.scss";
import router from "./router/router";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
