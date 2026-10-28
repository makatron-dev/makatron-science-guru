import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

export default function VaultPage() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("all"); // all | avatar | title | powerup

  async function loadData() {
    try {
      const [vaultItems, myInv] = await Promise.all([
        api.getVaultItems(),
        api.getMyInventory()
      ]);
      setItems(vaultItems);
      setInventory(myInv);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleBuy(itemId) {
    setBuying(itemId);
    setError("");
    setSuccess("");
    try {
      const res = await api.buyVaultItem(itemId);
      setSuccess(res.message);
      if (refreshUser) await refreshUser();
      await loadData(); // Re-fetch inventory to update button states
    } catch (err) {
      setError(err.message);
    } finally {
      setBuying(null);
    }
  }

  if (!user) return null;

  // Determine button state for an item
  const getButtonState = (item) => {
    const owned = inventory.find(i => i.item_id === item.id);
    
    // Avatars & Titles: Can only buy once
    if (item.type === "avatar" || item.type === "title") {
      if (owned) {
        return { label: "Owned ✓", disabled: true, background: "var(--mk-success)", color: "#000" };
      }
    }
    
    // Power-Ups: 7-day cooldown
    if (item.type === "powerup" && owned) {
      const lastBought = new Date(owned.purchased_at);
      const daysSince = Math.floor((new Date() - lastBought) / (1000 * 60 * 60 * 24));
      if (daysSince < 7) {
        return { 
          label: `Wait ${7 - daysSince} day${7 - daysSince === 1 ? '' : 's'}`, 
          disabled: true, 
          background: "var(--mk-bg-elev-2)", 
          color: "var(--mk-text-faint)" 
        };
      }
    }

    // Default (Buy Now)
    if (user.coins < item.price) {
      return { label: "Not enough coins", disabled: true, background: "var(--mk-bg-elev-2)", color: "var(--mk-text-faint)" };
    }

    return { label: "Buy Now", disabled: false, background: "var(--mk-warning)", color: "#000" };
  };

  const filteredItems = tab === "all" ? items : items.filter(i => i.type === tab);

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 1000, margin: "0 auto" }}>
      
      <div className="row-between" style={{ marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "var(--mk-text)" }}>🏪 The Vault</h1>
          <p className="text-dim" style={{ margin: "8px 0 0 0" }}>Spend your hard-earned coins on exclusive items.</p>
        </div>
        <div style={{ background: "rgba(251, 191, 36, 0.1)", padding: "12px 24px", borderRadius: "var(--mk-radius-pill)", border: "1px solid var(--mk-warning)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.2rem" }}>🪙</span>
          <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--mk-warning)" }}>{user.coins || 0}</span>
        </div>
      </div>

      {error && <div style={{ background: "rgba(255, 77, 77, 0.1)", border: "1px solid var(--mk-danger)", padding: 16, borderRadius: 8, marginBottom: 24, color: "var(--mk-danger)", fontWeight: 700 }}>{error}</div>}
      {success && <div style={{ background: "rgba(34, 217, 154, 0.1)", border: "1px solid var(--mk-success)", padding: 16, borderRadius: 8, marginBottom: 24, color: "var(--mk-success)", fontWeight: 700 }}>{success}</div>}

      {/* TABS */}
      <div className="row" style={{ gap: 12, marginBottom: 32, flexWrap: "wrap", borderBottom: "1px solid var(--mk-border)", paddingBottom: 12 }}>
        {[
          { id: "all", label: "All Items" },
          { id: "avatar", label: "👤 Avatars" },
          { id: "title", label: "🏷️ Titles" },
          { id: "powerup", label: "⚡ Power-Ups" },
        ].map(t => (
          <button 
            key={t.id} 
            className={tab === t.id ? "" : "secondary"} 
            onClick={() => setTab(t.id)}
            style={{ padding: "8px 20px", borderRadius: "var(--mk-radius-pill)", fontSize: "0.9rem" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="exam-grid">
          <div className="mk-skeleton mk-skeleton-card" />
          <div className="mk-skeleton mk-skeleton-card" />
          <div className="mk-skeleton mk-skeleton-card" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 60, borderStyle: "dashed" }}>
          <p className="text-dim" style={{ margin: 0 }}>No items in this category yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
          {filteredItems.map((item) => {
            const btn = getButtonState(item);
            return (
              <div key={item.id} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", borderTop: "4px solid var(--mk-warning)" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", fontWeight: 800, color: "var(--mk-text)" }}>{item.name}</h3>
                <p className="text-dim" style={{ fontSize: "0.8rem", margin: "0 0 16px", flex: 1, lineHeight: 1.4 }}>{item.desc}</p>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--mk-warning)", marginBottom: 16 }}>
                  🪙 {item.price}
                </div>
                <button 
                  onClick={() => handleBuy(item.id)} 
                  disabled={buying === item.id || btn.disabled}
                  style={{ width: "100%", background: btn.background, color: btn.color, fontSize: "0.9rem", fontWeight: 700 }}
                >
                  {buying === item.id ? "Buying..." : btn.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}