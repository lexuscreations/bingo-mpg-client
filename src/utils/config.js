// Central configuration for Backend API & WebSocket URLs
// Seamlessly adapts to local development (localhost:3000) and production deployment (Render)

const rawBackendUrl =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://bingo-mpg.onrender.com");

export const BACKEND_URL = rawBackendUrl
  ? rawBackendUrl.trim().replace(/\/+$/, "")
  : "";

