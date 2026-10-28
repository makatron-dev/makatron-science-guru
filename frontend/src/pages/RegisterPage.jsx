import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { api } from "../api.js";
import { EDUCATION_LEVELS, LEVEL_LABELS } from "../constants.js";
import Logo from "../components/Logo.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  
  const [form, setForm] = useState({
    display_name: "",
    school_id: "",
    school_name: "",
    email: "",
    password: "",
    education_level: "senior"
  });
  
  const [schools, setSchools] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showOtherSchool, setShowOtherSchool] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // NEW: Terms agreement state
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Fetch schools on load
  useEffect(() => {
    api.getSchools().then(setSchools).catch(() => {});
  }, []);

  // Derive unique list of states from the schools data
  const uniqueStates = [...new Set(schools.map(s => s.state).filter(Boolean))].sort();

  // Filter schools based on selected state AND search query
  const filteredSchools = schools.filter(s => {
    const stateMatch = !selectedState || s.state === selectedState;
    const searchMatch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return stateMatch && searchMatch;
  });

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // NEW: Safety check
    if (!agreedToTerms) {
      setErr("You must agree to the Terms of Service to create an account.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        ...form,
        school_id: form.school_id ? parseInt(form.school_id) : null,
        school_name: showOtherSchool ? form.school_name : null,
        referral_code: referralCode || null
      };
      
      if (!payload.school_id && !payload.school_name) {
        throw new Error("Please select or enter your school.");
      }

      const res = await register({ ...payload, exam_target: "jamb", subjects: [] });
      
      alert(`Registration Successful!\n\nYour Username is: ${res.recovery_username}\n\nPlease save this. You will need it to log in.`);
      navigate("/dashboard");
    } catch (ex) {
      setErr(ex.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", background: "var(--mk-bg)", overflow: "hidden" }}>
      
      {/* LEFT SIDE - MARKETING */}
      <div 
        className="desktop-nav" 
        style={{ 
          flex: 1.2, 
          background: "linear-gradient(135deg, var(--mk-bg-elev), var(--mk-bg-elev-2))", 
          borderRight: "1px solid var(--mk-border-strong)", 
          display: "flex", 
          flexDirection: "column",
          overflowY: "auto",
          position: "relative",
          scrollbarWidth: "thin"
        }}
      >
        <div style={{ position: "fixed", top: 0, left: 0, width: "50%", height: "100%", backgroundImage: "radial-gradient(circle, var(--mk-border) 1px, transparent 1.5px)", backgroundSize: "32px 32px", opacity: 0.4, pointerEvents: "none", zIndex: 0 }}></div>
        <div style={{ position: "fixed", top: "20%", left: "10%", width: "600px", height: "600px", background: "radial-gradient(circle, var(--mk-glow-accent-soft) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }}></div>

        <div style={{ position: "relative", zIndex: 10, padding: "60px 80px 120px", display: "flex", flexDirection: "column", gap: "64px" }}>
          
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "var(--mk-radius-pill)", background: "rgba(0, 212, 255, 0.1)", border: "1px solid rgba(0, 212, 255, 0.3)", color: "var(--mk-accent)", fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--mk-accent)", boxShadow: "0 0 10px var(--mk-accent)" }}></span>
              Join the Elite
            </div>
            <h1 style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: "24px", color: "var(--mk-text)" }}>
              Your Journey to <br/>
              <span className="mk-gradient-text">Excellence Starts Here</span>
            </h1>
            <p style={{ fontSize: "1.15rem", lineHeight: 1.6, maxWidth: "90%", color: "var(--mk-text-dim)", fontWeight: 500 }}>
              Stop guessing. Start preparing. Get unlimited access to thousands of curated science questions, timed mock exams, and real-time performance analytics.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-text-faint)", marginBottom: "16px" }}>Prepare For:</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {["JAMB", "WAEC", "IGCSE", "BECE", "NECO"].map((exam, i) => (
                <div key={i} style={{ padding: "8px 20px", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border-strong)", borderRadius: "var(--mk-radius-pill)", fontSize: "0.95rem", fontWeight: 800, color: "var(--mk-text)" }}>
                  {exam}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-text-faint)", marginBottom: "20px" }}>The MAKAVERSE Advantage</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { icon: "⏱️", title: "Real Exam Pressure", desc: "Timed mocks that simulate actual CBT conditions." },
                { icon: "📊", title: "AI Performance Tracking", desc: "Identify weak topics and fix them instantly." },
                { icon: "🏆", title: "Global Leaderboard", desc: "Compete with students nationwide and climb the ranks." },
                { icon: "⚡", title: "Instant Solutions", desc: "Deep explanations for every single question." }
              ].map((feat, i) => (
                <div key={i} style={{ padding: "20px", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border-strong)", borderRadius: "var(--mk-radius)" }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{feat.icon}</div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "6px", color: "var(--mk-text)" }}>{feat.title}</h3>
                  <p style={{ fontSize: "0.85rem", margin: 0, lineHeight: 1.4, color: "var(--mk-text-dim)", fontWeight: 500 }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-text-faint)", marginBottom: "20px" }}>Wall of Fame</h2>
            <div style={{ padding: "24px", borderLeft: "4px solid var(--mk-warning)", background: "var(--mk-bg-elev)", borderRadius: "var(--mk-radius)", borderTop: "1px solid var(--mk-border)", borderRight: "1px solid var(--mk-border)", borderBottom: "1px solid var(--mk-border)" }}>
              <p style={{ fontSize: "1.05rem", fontStyle: "italic", color: "var(--mk-text)", marginBottom: "16px", lineHeight: 1.5, fontWeight: 600 }}>
                "I moved from a C6 to an A1 in JAMB Biology. The championship arena and the instant explanations are absolute game changers."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--mk-warning)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "var(--mk-bg)", fontSize: "1.1rem" }}>A</div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--mk-text)" }}>Adebayo O.</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--mk-text-dim)", fontWeight: 600 }}>Lagos Model College</div>
                </div>
                <div style={{ marginLeft: "auto", color: "var(--mk-warning)", fontSize: "1.2rem", letterSpacing: "2px" }}>★★★★★</div>
              </div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mk-text-faint)", marginBottom: "20px" }}>Voices of Legends</h2>
            <div className="stack" style={{ gap: "12px" }}>
              {[
                { quote: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
                { quote: "If I have seen further it is by standing on the shoulders of Giants.", author: "Isaac Newton" }
              ].map((legend, i) => (
                <div key={i} style={{ padding: "20px", background: "var(--mk-bg-elev)", border: "1px solid var(--mk-border)", borderLeft: "4px solid var(--mk-brand-secondary)", borderRadius: "var(--mk-radius)" }}>
                  <p style={{ fontSize: "1rem", fontStyle: "italic", color: "var(--mk-text)", marginBottom: "8px", fontWeight: 500 }}>"{legend.quote}"</p>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--mk-accent)" }}>— {legend.author}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h3 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "12px", color: "var(--mk-text)" }}>Don't Get Left Behind.</h3>
            <p style={{ fontSize: "1rem", marginBottom: "24px", color: "var(--mk-text-dim)", fontWeight: 500 }}>Thousands of students are already practicing. Your first mock exam is waiting.</p>
            <div style={{ display: "inline-block", padding: "12px 24px", background: "var(--mk-accent)", color: "var(--mk-accent-text)", borderRadius: "var(--mk-radius)", fontWeight: 800, fontSize: "1rem", boxShadow: "var(--mk-glow-accent-soft)", pointerEvents: "none" }}>
              Complete the Form to Start →
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT SIDE - REGISTRATION FORM */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 10, overflowY: "auto" }}>
        
        <div style={{ width: "100%", maxWidth: 440, padding: "40px 20px", display: "flex", flexDirection: "column", minHeight: "100%" }}>
          
          <div style={{ marginBottom: "32px", display: "flex", justifyContent: "center" }}>
            <Logo size="md" vertical={true} />
          </div>

          <div className="card" style={{ padding: "40px 32px", background: "var(--mk-glass-bg)", backdropFilter: "blur(var(--mk-glass-blur))", border: "1px solid var(--mk-glass-border)", marginTop: "auto", marginBottom: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}>Create Account</h1>
              <p style={{ marginTop: 8, fontSize: "0.95rem", color: "var(--mk-text-dim)" }}>Join thousands of students preparing for excellence.</p>
            </div>

            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label>Full Name</label>
                <input required value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="e.g. John Doe" style={{ height: 48 }} />
              </div>

              {/* STATE & SCHOOL SELECTION */}
              {!showOtherSchool && (
                <>
                  <div>
                    <label>State</label>
                    <select 
                      required 
                      value={selectedState} 
                      onChange={e => {
                        setSelectedState(e.target.value);
                        setForm({ ...form, school_id: "" }); 
                        setSearchQuery("");
                      }}
                      style={{ height: 48 }}
                    >
                      <option value="">Select State...</option>
                      {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label>School</label>
                    
                    <div style={{ position: "relative", marginBottom: 8 }}>
                      <input 
                        type="text" 
                        placeholder="Search school..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ height: 44, paddingLeft: 36, fontSize: "0.9rem" }}
                      />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mk-text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>

                    <select 
                      required 
                      value={form.school_id} 
                      onChange={e => setForm({ ...form, school_id: e.target.value })}
                      style={{ height: 48 }}
                      disabled={!selectedState}
                    >
                      <option value="">{selectedState ? "Select School..." : "Select a state first"}</option>
                      {filteredSchools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* CUSTOM SCHOOL INPUT TOGGLE */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input 
                  type="checkbox" 
                  id="otherSchool" 
                  checked={showOtherSchool} 
                  onChange={e => {
                    setShowOtherSchool(e.target.checked);
                    setForm({ ...form, school_id: "", school_name: "" });
                  }}
                  style={{ width: "auto", height: "auto", minHeight: "unset" }}
                />
                <label htmlFor="otherSchool" style={{ margin: 0, textTransform: "none", fontSize: "0.85rem", cursor: "pointer" }}>
                  My school is not in the list
                </label>
              </div>

              {/* CUSTOM SCHOOL INPUT */}
              {showOtherSchool && (
                <div>
                  <label>Enter School Name</label>
                  <input 
                    required 
                    value={form.school_name} 
                    onChange={e => setForm({ ...form, school_name: e.target.value })} 
                    placeholder="e.g. Bright Future Academy" 
                    style={{ height: 48, borderColor: "var(--mk-warning)" }} 
                  />
                  <p className="text-faint" style={{ fontSize: "0.75rem", marginTop: 4, marginLeft: 4 }}>Only use this if your school is not in the list.</p>
                </div>
              )}
              
              <div>
                <label>Class Level</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 4 }}>
                  {EDUCATION_LEVELS.map(lvl => (
                    <button 
                      type="button" 
                      key={lvl} 
                      onClick={() => setForm({ ...form, education_level: lvl })}
                      style={{ 
                        padding: "10px 8px", 
                        fontSize: "0.85rem", 
                        background: form.education_level === lvl ? "var(--mk-accent)" : "var(--mk-bg)", 
                        color: form.education_level === lvl ? "var(--mk-accent-text)" : "var(--mk-text-dim)",
                        border: `1px solid ${form.education_level === lvl ? "var(--mk-accent)" : "var(--mk-border-strong)"}`,
                        boxShadow: form.education_level === lvl ? "var(--mk-glow-accent-soft)" : "none",
                        fontWeight: 700
                      }}
                    >
                      {LEVEL_LABELS[lvl]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label>Email <span style={{ color: "var(--mk-text-faint)", fontWeight: 600, textTransform: "none" }}>(Optional)</span></label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" style={{ height: 48 }} />
              </div>

              <div>
                <label>Password</label>
                <div style={{ position: "relative" }}>
                  <input required type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} style={{ height: 48, paddingRight: 48 }} placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--mk-text-dim)", fontWeight: 700, fontSize: "0.85rem" }}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* NEW: TERMS OF SERVICE CHECKBOX */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 8 }}>
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={agreedToTerms} 
                  onChange={(e) => setAgreedToTerms(e.target.checked)} 
                  style={{ width: 20, height: 20, minHeight: "unset", marginTop: 2, cursor: "pointer", accentColor: "var(--mk-accent)" }}
                />
                <label htmlFor="terms" style={{ fontSize: "0.85rem", color: "var(--mk-text-dim)", cursor: "pointer", lineHeight: 1.4, textTransform: "none", letterSpacing: 0, fontWeight: 500, margin: 0 }}>
                  I agree to the <Link to="/terms" target="_blank" style={{ color: "var(--mk-accent)", fontWeight: 800, textDecoration: "underline" }}>Terms of Service</Link> and confirm I will only create <strong>one account</strong>.
                </label>
              </div>

              {err && (
                <div style={{ background: "rgba(255, 107, 107, 0.1)", borderLeft: "3px solid var(--mk-danger)", padding: "10px 14px", borderRadius: 4 }}>
                  <p style={{ color: "var(--mk-danger)", margin: 0, fontSize: "0.85rem", fontWeight: 700 }}>{err}</p>
                </div>
              )}
              
              <button type="submit" disabled={busy || !agreedToTerms} style={{ height: 48, fontSize: "1rem", fontWeight: 800, marginTop: 8 }}>
                {busy ? "Creating Account..." : "Create Free Account"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24, borderTop: "1px solid var(--mk-border)", paddingTop: 20 }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--mk-text-dim)", fontWeight: 500 }}>
                Already have an account? <Link to="/login" style={{ fontWeight: 800, color: "var(--mk-accent)" }}>Log in</Link>
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}