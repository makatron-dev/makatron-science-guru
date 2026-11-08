import { useLocation, useNavigate } from "react-router-dom";

/**
 * In-app back button.
 * - Hides itself on the dashboard (nothing to go back to).
 * - Uses browser history when available, otherwise falls back to /dashboard.
 * - Optional `to` prop overrides the destination.
 */
export default function BackButton({ to = null, label = "Back", style }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render on dashboard — that's the "home" of the student area
  if (location.pathname === "/dashboard") return null;

  const handleBack = () => {
    if (to) {
      navigate(to);
      return;
    }
    // If we have history from within the app, go back. Otherwise dashboard.
    if (window.history.length > 1 && document.referrer) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="secondary"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        fontSize: "0.9rem",
        fontWeight: 600,
        borderRadius: "var(--mk-radius-pill)",
        marginBottom: 16,
        ...style,
      }}
    >
      <span aria-hidden="true">←</span>
      {label}
    </button>
  );
}