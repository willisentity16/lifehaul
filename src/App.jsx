import { useState, useRef, useEffect } from "react";

const TRANSITIONS = [
  { id: "moving", icon: "🏠", label: "Moving / Relocating", sub: "Local, long-distance, or international move" },
  { id: "divorce", icon: "💔", label: "Divorce / Separation", sub: "Navigating life after a relationship ends" },
  { id: "job_loss", icon: "📋", label: "Job Loss / Career Change", sub: "Layoff, resignation, or career pivot" },
  { id: "new_job", icon: "💼", label: "New Job / Relocation", sub: "Starting fresh in a new role or city" },
  { id: "retirement", icon: "🌅", label: "Retirement", sub: "Transitioning out of your career" },
  { id: "downsizing", icon: "📦", label: "Downsizing", sub: "Moving to a smaller home or simplifying life" },
  { id: "upsizing", icon: "🏡", label: "Upsizing / Growing Family", sub: "Expanding your home or family" },
  { id: "loss", icon: "🕊", label: "Loss of Loved One", sub: "Navigating grief and estate transitions" },
  { id: "new_baby", icon: "👶", label: "New Baby / Adoption", sub: "Preparing for a new family member" },
  { id: "health", icon: "🏥", label: "Health Crisis / Recovery", sub: "Major illness, surgery, or disability" },
  { id: "business", icon: "🚀", label: "Starting a Business", sub: "Launching or growing your own company" },
  { id: "business_close", icon: "🔒", label: "Closing a Business", sub: "Winding down or selling your business" },
  { id: "college", icon: "🎓", label: "College / Leaving Home", sub: "First time living independently" },
  { id: "senior", icon: "🧓", label: "Senior Living Transition", sub: "Moving to assisted or senior living" },
  { id: "military", icon: "🎖️", label: "Military Transition", sub: "Deployment, return, or service exit" },
  { id: "immigration", icon: "✈️", label: "Immigration / Visa Change", sub: "Moving to a new country or citizenship" },
  { id: "addiction", icon: "🌱", label: "Recovery / Sobriety", sub: "Rebuilding life after addiction" },
  { id: "financial", icon: "💰", label: "Financial Crisis / Bankruptcy", sub: "Rebuilding after financial hardship" },
  { id: "empty_nest", icon: "🪺", label: "Empty Nest", sub: "Kids have left home — now what?" },
  { id: "other", icon: "🔄", label: "Other Life Change", sub: "Something not listed above" },
];

function parseMarkdown(text) {
  const lines = text.split("\n");
  const elements = [];
  let key = 0;
  for (const line of lines) {
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} style={{ fontSize: "1.05rem", fontFamily: "'Playfair Display', serif", color: "#c8a96e", marginTop: "1.8rem", marginBottom: "0.5rem", borderBottom: "1px solid rgba(200,169,110,0.2)", paddingBottom: "0.35rem" }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.match(/^[-•*]\s/)) {
      const content = line.replace(/^[-•*]\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong style='color:#e8d5a3'>$1</strong>");
      elements.push(
        <div key={key++} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.45rem", paddingLeft: "0.25rem" }}>
          <span style={{ color: "#c8a96e", flexShrink: 0, marginTop: "2px" }}>▸</span>
          <span style={{ fontSize: "0.86rem", lineHeight: 1.65, color: "#d8d0c0" }} dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: "0.25rem" }} />);
    } else if (line.trim()) {
      const content = line.replace(/\*\*(.*?)\*\*/g, "<strong style='color:#e8d5a3'>$1</strong>");
      elements.push(
        <p key={key++} style={{ fontSize: "0.86rem", lineHeight: 1.7, color: "#c8c0b0", marginBottom: "0.25rem" }} dangerouslySetInnerHTML={{ __html: content }} />
      );
    }
  }
  return elements;
}

export default function LifeHAUL() {
  const [step, setStep] = useState("select");
  const [selected, setSelected] = useState(null);
  const [intake, setIntake] = useState({ name: "", phone: "", email: "", location: "" });
  const [details, setDetails] = useState("");
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  const intakeComplete = intake.name.trim() && intake.phone.trim() && intake.email.trim() && intake.location.trim();
  const selectedTransition = TRANSITIONS.find(t => t.id === selected);

  function reset() {
    setStep("select"); setSelected(null);
    setIntake({ name: "", phone: "", email: "", location: "" });
    setDetails(""); setPlan(""); setError("");
  }

  async function handleGenerate() {
    if (!details.trim()) return;
    setStep("loading");
    setError("");
    try {
      const firstName = intake.name.split(" ")[0];
      const label = selectedTransition?.label || selected;
      const prompt = `You are LifeHAUL, an expert AI Life Transition Advisor.

Person: ${intake.name}, in ${intake.location}.
Life Transition: ${label}
Their situation: ${details}

Create a thorough, personalized Life Transition Plan for ${firstName}. Be warm but direct. Use their name. Reference their location where helpful.

Use these exact section headers:

## 🧭 Your Situation — What You're Facing
## ⚡ Do These First — Next 7 Days
## 📅 Your 30-Day Roadmap
## 🔑 Every Area of Life to Handle
## 📞 Who to Contact & What Services You Need
## ⚠️ Mistakes People Make in This Situation
## 🏁 90 Days From Now — Your New Normal
## 🔥 3 Power Moves That Will Change Everything

Be specific, actionable, and thorough. Name real professionals to contact. Cover all relevant life areas.`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      if (!data.text) throw new Error("No plan returned");
      setPlan(data.text);
      setStep("result");
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setStep("details");
    }
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(200,169,110,0.2)", borderRadius: "10px",
    padding: "0.75rem 1rem", color: "#e8e0d0", fontSize: "0.85rem",
    outline: "none", fontFamily: "'Lato', sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const goldBtn = (disabled) => ({
    width: "100%", border: "none", borderRadius: "10px", padding: "1rem",
    background: disabled ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #c8a96e, #a07840)",
    color: disabled ? "#4a4035" : "#0d0d0d",
    fontSize: "0.88rem", fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "0.08em", textTransform: "uppercase",
  });

  return (
    <div ref={topRef} style={{ minHeight: "100vh", background: "#0d0d0d", backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(200,169,110,0.07) 0%, transparent 50%)", fontFamily: "'Lato', sans-serif", color: "#e8e0d0" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap" rel="stylesheet" />
      <div style={{ textAlign: "center", padding: "2.5rem 1rem 1.5rem", borderBottom: "1px solid rgba(200,169,110,0.12)" }}>
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.35em", color: "#c8a96e", textTransform: "uppercase", marginBottom: "0.4rem", fontWeight: 700 }}>AI Life Transition Assistant</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 6vw, 3rem)", fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #e8d5a3, #c8a96e, #a07840)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>LifeHAUL</h1>
        <p style={{ color: "#6a6055", fontSize: "0.8rem", marginTop: "0.3rem", fontWeight: 300 }}>Navigate every transition with clarity and confidence</p>
      </div>
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem 1rem 4rem" }}>
        {step === "select" && (
          <div>
            <p style={{ textAlign: "center", color: "#6a6055", fontSize: "0.82rem", marginBottom: "1.5rem" }}>What life change are you navigating?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: "0.6rem" }}>
              {TRANSITIONS.map(t => (
                <button key={t.id} onClick={() => { setSelected(t.id); setStep("intake"); }}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,169,110,0.13)", borderRadius: "10px", padding: "0.85rem 1rem", cursor: "pointer", textAlign: "left", transition: "all 0.18s", color: "#e8e0d0" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,169,110,0.08)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.13)"; }}>
                  <div style={{ fontSize: "1.3rem", marginBottom: "0.25rem" }}>{t.icon}</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e8d5a3", marginBottom: "0.15rem" }}>{t.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#5a5045", lineHeight: 1.4 }}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === "intake" && (
          <div>
            <button onClick={reset} style={{ background: "none", border: "none", color: "#c8a96e", cursor: "pointer", fontSize: "0.8rem", marginBottom: "1.5rem", padding: 0 }}>← Back</button>
            <div style={{ background: "rgba(200,169,110,0.06)", border: "1px solid rgba(200,169,110,0.18)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>{selectedTransition?.icon}</div>
              <div style={{ fontSize: "0.95rem", fontFamily: "'Playfair Display', serif", color: "#e8d5a3" }}>{selectedTransition?.label}</div>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#6a6055", marginBottom: "1.2rem" }}>Enter your info so we can personalize your plan.</p>
            {[
              { key: "name", label: "Full Name", placeholder: "John Smith", type: "text" },
              { key: "phone", label: "Phone Number", placeholder: "(555) 000-0000", type: "tel" },
              { key: "email", label: "Email Address", placeholder: "john@email.com", type: "email" },
              { key: "location", label: "City & State", placeholder: "Saint Joseph, MI", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.7rem", color: "#7a7060", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.35rem" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={intake[f.key]}
                  onChange={e => setIntake(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "rgba(200,169,110,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
              </div>
            ))}
            <p style={{ fontSize: "0.7rem", color: "#3a3025", marginBottom: "1rem" }}>🔒 Your info is private and never sold.</p>
            <button onClick={() => setStep("details")} disabled={!intakeComplete} style={goldBtn(!intakeComplete)}>Continue →</button>
          </div>
        )}
        {step === "details" && (
          <div>
            <button onClick={() => setStep("intake")} style={{ background: "none", border: "none", color: "#c8a96e", cursor: "pointer", fontSize: "0.8rem", marginBottom: "1.5rem", padding: 0 }}>← Back</button>
            <div style={{ background: "rgba(200,169,110,0.06)", border: "1px solid rgba(200,169,110,0.18)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.2rem" }}>{selectedTransition?.icon}</div>
              <div style={{ fontSize: "0.95rem", fontFamily: "'Playfair Display', serif", color: "#e8d5a3" }}>{selectedTransition?.label}</div>
            </div>
            <label style={{ display: "block", fontSize: "0.7rem", color: "#7a7060", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Tell us about your situation</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={6}
              placeholder="The more detail you share, the better your plan. What's happening, when, and what concerns you most?"
              style={{ ...inputStyle, lineHeight: 1.6, resize: "vertical" }}
              onFocus={e => e.target.style.borderColor = "rgba(200,169,110,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
            {error && (
              <div style={{ background: "rgba(220,80,80,0.08)", border: "1px solid rgba(220,80,80,0.2)", borderRadius: "8px", padding: "0.75rem", marginTop: "0.75rem" }}>
                <p style={{ color: "#e06060", fontSize: "0.75rem", margin: 0 }}>{error}</p>
              </div>
            )}
            <button onClick={handleGenerate} disabled={!details.trim()} style={{ ...goldBtn(!details.trim()), marginTop: "1rem" }}>
              Generate My Transition Plan →
            </button>
          </div>
        )}
        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ width: "44px", height: "44px", border: "2px solid rgba(200,169,110,0.15)", borderTop: "2px solid #c8a96e", borderRadius: "50%", margin: "0 auto 1.5rem", animation: "spin 1s linear infinite" }} />
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#c8a96e", marginBottom: "0.4rem" }}>Building your plan...</p>
            <p style={{ fontSize: "0.76rem", color: "#5a5045" }}>Analyzing your transition across every area of life</p>
          </div>
        )}
        {step === "result" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "#c8a96e", textTransform: "uppercase" }}>Your Personalized</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#e8d5a3" }}>Life Transition Plan</div>
                <div style={{ fontSize: "0.72rem", color: "#5a5045", marginTop: "0.2rem" }}>{intake.name} · {selectedTransition?.label}</div>
              </div>
              <button onClick={reset} style={{ background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.25)", borderRadius: "8px", padding: "0.45rem 0.9rem", color: "#c8a96e", fontSize: "0.76rem", cursor: "pointer", fontWeight: 700 }}>New Plan</button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(200,169,110,0.12)", borderRadius: "14px", padding: "1.5rem" }}>
              {parseMarkdown(plan)}
            </div>
            <div style={{ marginTop: "1.5rem", background: "linear-gradient(135deg, rgba(200,169,110,0.09), rgba(200,169,110,0.03))", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "12px", padding: "1.2rem", textAlign: "center" }}>
              <div style={{ fontSize: "0.68rem", color: "#c8a96e", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Need help with your move?</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#e8d5a3", marginBottom: "0.25rem" }}>HE-HAULS LLC</div>
              <div style={{ fontSize: "0.75rem", color: "#5a5045" }}>Local & long-distance · Packing · Commercial · hehauls.com</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
