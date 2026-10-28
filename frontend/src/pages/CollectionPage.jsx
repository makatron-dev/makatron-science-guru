import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";

// This must match the VAULT_ITEMS list in backend/main.py exactly
const VAULT_CATALOG = {
  // Avatars
  "avatar_hacker": { name: "Neon Hacker", type: "avatar", icon: "👨‍💻" },
  "avatar_robot": { name: "Quantum Robot", type: "avatar", icon: "🤖" },
  "avatar_alien": { name: "Cosmic Alien", type: "avatar", icon: "👽" },
  "avatar_ninja": { name: "Cyber Ninja", type: "avatar", icon: "🥷" },
  "avatar_samurai": { name: "Star Samurai", type: "avatar", icon: "⚔️" },
  "avatar_pilot": { name: "Starfighter Pilot", type: "avatar", icon: "🚀" },
  "avatar_astronaut": { name: "Deep Space Explorer", type: "avatar", icon: "👨‍🚀" },
  "avatar_doctor": { name: "Quantum Doctor", type: "avatar", icon: "👨‍⚕️" },
  "avatar_scientist": { name: "Mad Scientist", type: "avatar", icon: "👨‍🔬" },
  "avatar_wizard": { name: "Tech Wizard", type: "avatar", icon: "🧙‍♂️" },
  "avatar_vampire": { name: "Neon Vampire", type: "avatar", icon: "🧛" },
  "avatar_werewolf": { name: "Cyber Werewolf", type: "avatar", icon: "🐺" },
  "avatar_gorilla": { name: "Gorilla Warrior", type: "avatar", icon: "🦍" },
  "avatar_dragon": { name: "Space Dragon", type: "avatar", icon: "🐉" },
  "avatar_tiger": { name: "Saber Tiger", type: "avatar", icon: "🐯" },
  "avatar_lion": { name: "Alpha Lion", type: "avatar", icon: "🦁" },
  "avatar_eagle": { name: "Sky Eagle", type: "avatar", icon: "🦅" },
  "avatar_phoenix": { name: "Phoenix Rising", type: "avatar", icon: "🔥" },
  "avatar_ghost": { name: "Ghost Protocol", type: "avatar", icon: "👻" },
  "avatar_king": { name: "The Sovereign", type: "avatar", icon: "👑" },

  // Titles
  "title_scavenger": { name: "The Scavenger", type: "title", icon: "🥾" },
  "title_survivor": { name: "The Survivor", type: "title", icon: "🩹" },
  "title_student": { name: "Eternal Student", type: "title", icon: "📚" },
  "title_gunslinger": { name: "The Gunslinger", type: "title", icon: "🔫" },
  "title_scientist": { name: "The Scientist", type: "title", icon: "🔬" },
  "title_thinker": { name: "The Thinker", type: "title", icon: "🧠" },
  "title_analyst": { name: "The Analyst", type: "title", icon: "📊" },
  "title_strategist": { name: "The Strategist", type: "title", icon: "♟️" },
  "title_destroyer": { name: "JAMB Destroyer", type: "title", icon: "⚔️" },
  "title_genius": { name: "Certified Genius", type: "title", icon: "🧠" },
  "title_overlord": { name: "The Overlord", type: "title", icon: "😈" },
  "title_sage": { name: "The Sage", type: "title", icon: "🧘" },
  "title_ghost": { name: "The Ghost", type: "title", icon: "👻" },
  "title_lord": { name: "Lord Makaverse", type: "title", icon: "👑" },
  "title_legend": { name: "Living Legend", type: "title", icon: "🌟" },

  // Power-Ups
  "powerup_ai_pass": { name: "AI Unlimited Pass", type: "powerup", icon: "🤖" },
  "powerup_streak_shield": { name: "Streak Shield", type: "powerup", icon: "🛡️" },
  "powerup_retake_token": { name: "Mock Retake Token", type: "powerup", icon: "🎟️" },
  "powerup_xp_boost": { name: "XP Boost (2x)", type: "powerup", icon: "⚡" },
  "powerup_coin_boost": { name: "Coin Boost (2x)", type: "powerup", icon: "🪙" },
  "powerup_hint": { name: "Question Hint", type: "powerup", icon: "💡" },
  "powerup_skip": { name: "Skip Question", type: "powerup", icon: "⏭️" },
  "powerup_mystery_box": { name: "Mystery Box", type: "powerup", icon: "🎁" },
  "powerup_title_color": { name: "Custom Title Color", type: "powerup", icon: "🎨" },
  "powerup_avatar_frame": { name: "Golden Avatar Frame", type: "powerup", icon: "🖼️" },
  "powerup_extra_life": { name: "Extra Life", type: "powerup", icon: "❤️" },
  "powerup_double_coins": { name: "Double Coins (Daily)", type: "powerup", icon: "💰" },
  "powerup_double_xp": { name: "Double XP (Daily)", type: "powerup", icon: "🌟" },
  "powerup_library_access": { name: "Library Access (7 Days)", type: "powerup", icon: "📚" },
  "powerup_premium_trial": { name: "Premium Trial (3 Days)", type: "powerup", icon: "✨" },
};

export default function CollectionPage() {
  const { user, refreshUser } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState(null);

  useEffect(() => {
    api.getMyInventory()
      .then(setInventory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleEquip(itemId, itemType) {
    setEquipping(itemId);
    try {
      await api.equipVaultItem(itemId);
      if (refreshUser) await refreshUser();
    } catch (err) {
      alert(err.message);
    } finally {
      setEquipping(null);
    }
  }

  if (!user) return null;

  // Group inventory by type
  const ownedAvatars = inventory.filter(i => i.item_type === "avatar").map(i => ({ ...VAULT_CATALOG[i.item_id], item_id: i.item_id, purchased_at: i.purchased_at })).filter(i => i.name);
  const ownedTitles = inventory.filter(i => i.item_type === "title").map(i => ({ ...VAULT_CATALOG[i.item_id], item_id: i.item_id, purchased_at: i.purchased_at })).filter(i => i.name);
  const ownedPowerups = inventory.filter(i => i.item_type === "powerup").map(i => ({ ...VAULT_CATALOG[i.item_id], item_id: i.item_id, purchased_at: i.purchased_at })).filter(i => i.name);

  return (
    <div className="container" style={{ padding: "32px 16px", maxWidth: 900, margin: "0 auto" }}>
      
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, color: "var(--mk-text)" }}>🎒 My Collection</h1>
        <p className="text-dim" style={{ margin: "8px 0 0 0" }}>All the items you've purchased from the Vault.</p>
      </div>

      {loading ? (
        <div className="mk-skeleton" style={{ height: 300, width: "100%", borderRadius: "var(--mk-radius-lg)" }} />
      ) : inventory.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 20px", borderStyle: "dashed" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📦</div>
          <h3 style={{ margin: "0 0 8px", color: "var(--mk-text)" }}>Your Collection is Empty</h3>
          <p className="text-dim" style={{ margin: "0 0 24px" }}>You haven't bought anything from the Vault yet.</p>
          <a href="/vault"><button>Go to The Vault →</button></a>
        </div>
      ) : (
        <div className="stack" style={{ gap: 40 }}>
          
          {/* AVATARS */}
          {ownedAvatars.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 16, color: "var(--mk-text)", borderBottom: "1px solid var(--mk-border)", paddingBottom: 8 }}>
                Avatars ({ownedAvatars.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
                {ownedAvatars.map(item => {
                  const isEquipped = user.avatar_id === item.item_id;
                  return (
                    <div key={item.item_id} className="card" style={{ textAlign: "center", padding: 20, border: isEquipped ? "2px solid var(--mk-success)" : "1px solid var(--mk-border)", background: isEquipped ? "rgba(34, 217, 154, 0.05)" : "var(--mk-bg-elev)" }}>
                      <div style={{ fontSize: "3rem", marginBottom: 12 }}>{item.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 16, color: "var(--mk-text)" }}>{item.name}</div>
                      {isEquipped ? (
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--mk-success)", textTransform: "uppercase" }}>✓ Equipped</div>
                      ) : (
                        <button onClick={() => handleEquip(item.item_id, item.type)} disabled={equipping === item.item_id} className="secondary" style={{ width: "100%", padding: "8px", fontSize: "0.8rem" }}>
                          {equipping === item.item_id ? "Equipping..." : "Equip"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TITLES */}
          {ownedTitles.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 16, color: "var(--mk-text)", borderBottom: "1px solid var(--mk-border)", paddingBottom: 8 }}>
                Titles ({ownedTitles.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {ownedTitles.map(item => {
                  const isEquipped = user.active_title === item.name;
                  return (
                    <div key={item.item_id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, border: isEquipped ? "2px solid var(--mk-success)" : "1px solid var(--mk-border)", background: isEquipped ? "rgba(34, 217, 154, 0.05)" : "var(--mk-bg-elev)" }}>
                      <div style={{ fontSize: "2rem" }}>{item.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 8, color: "var(--mk-text)" }}>{item.name}</div>
                        {isEquipped ? (
                          <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--mk-success)", textTransform: "uppercase" }}>✓ Equipped</div>
                        ) : (
                          <button onClick={() => handleEquip(item.item_id, item.type)} disabled={equipping === item.item_id} className="secondary" style={{ padding: "4px 12px", fontSize: "0.75rem", minHeight: 28 }}>
                            {equipping === item.item_id ? "..." : "Equip"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* POWER-UPS */}
          {ownedPowerups.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 16, color: "var(--mk-text)", borderBottom: "1px solid var(--mk-border)", paddingBottom: 8 }}>
                Power-Ups ({ownedPowerups.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {ownedPowerups.map(item => (
                  <div key={item.item_id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16 }}>
                    <div style={{ fontSize: "2rem" }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--mk-text)" }}>{item.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--mk-text-faint)", marginTop: 4 }}>
                        Bought: {new Date(item.purchased_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}