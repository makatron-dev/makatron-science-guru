import React from "react";
import { Link } from "react-router-dom";

export default function Logo({ size = "md", linkTo = "/", showText = true, vertical = false }) {
  const config = {
    sm: { iconSize: 28, fontSize: "1.1rem", subSize: "0.65rem", gap: 8 },
    md: { iconSize: 36, fontSize: "1.4rem", subSize: "0.75rem", gap: 10 },
    lg: { iconSize: 64, fontSize: "2.2rem", subSize: "0.9rem", gap: 16 },
  }[size] || { iconSize: 36, fontSize: "1.4rem", subSize: "0.75rem", gap: 10 };

  const LogoContent = (
    <div style={{ 
      display: "inline-flex", 
      flexDirection: vertical ? "column" : "row",
      alignItems: "center", 
      justifyContent: "center",
      gap: config.gap, 
      textDecoration: "none",
      textAlign: vertical ? "center" : "left"
    }}>
      
      {/* Premium CSS Icon */}
      <div style={{
        width: config.iconSize,
        height: config.iconSize,
        borderRadius: "30%", // Squircle
        background: "linear-gradient(135deg, var(--mk-accent), var(--mk-brand-secondary))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 32px rgba(0, 212, 255, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0
      }}>
        {/* Inner glow/shine */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)"
        }} />
        
        {/* The 'M' Icon */}
        <svg 
          width={config.iconSize * 0.55} 
          height={config.iconSize * 0.55} 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "relative", zIndex: 1 }}
        >
          <path d="M4 20V4L12 12L20 4V20" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: vertical ? "center" : "flex-start" }}>
          <div style={{ 
            fontSize: config.fontSize, 
            fontWeight: 900, 
            color: "var(--mk-text)", 
            lineHeight: 1, 
            letterSpacing: "-0.03em",
            textShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            MAKA<span style={{ 
              background: "linear-gradient(90deg, var(--mk-accent), var(--mk-brand-secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>VERSE</span>
          </div>
          <div style={{ 
            fontSize: config.subSize, 
            color: "var(--mk-text-dim)", 
            fontWeight: 800, 
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginTop: 4
          }}>
            EdTech
          </div>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} style={{ textDecoration: "none", outline: "none" }}>
        {LogoContent}
      </Link>
    );
  }

  return LogoContent;
}