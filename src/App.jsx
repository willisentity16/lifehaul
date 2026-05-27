import { useState, useRef, useEffect } from "react";

const TRANSITIONS = [
  { id: "moving", icon: "🏠", label: "Moving / Relocating", sub: "Local, long-distance, or international move" },
  { id: "divorce", icon: "💔", label: "Divorce / Separation", sub: "Navigating life after a relationship ends" },
  { id: "job_loss", icon: "📋", label: "Job Loss / Career Change", sub: "Layoff, resignation, or career pivot" },
  { id: "new_job", icon: "💼", label: "New Job / Relocation", sub: "Starting fresh in a new role or city" },
  { id: "retirement", icon: "🌅", label: "Retirement", sub: "Transitioning out of your career" },
  { id: "downsizing", icon: "📦", label: "Downsizing", sub: "Moving to a smaller home or simplifying life" },
  { id: "upsizing", icon: "🏡", label: "Upsizing / Growing Family", sub: "Expanding your home or family" },
  { id: "loss", icon: "🕊️", label: "Loss of Loved One", sub: "Navigating grief and estate transitions" },
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
        <h2 key={key++} style={{ fontSize: "0.7rem", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#111", marginTop: "2rem", marginBottom: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: "2px solid #111", paddingBottom: "0.4rem" }}>
          {line.replace("## ", "")}
        </h2>
      );
    } else if (line.match(/^[-•*]\s/)) {
      const content = line.replace(/^[-•*]\s/, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <div key={key++} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem", paddingLeft: "0.1rem" }}>
          <span style={{ color: "#111", flexShrink: 0, fontWeight: 700, fontSize: "0.75rem", marginTop: "3px" }}>—</span>
          <span style={{ fontSize: "0.88rem", lineHeight: 1.7, color: "#333" }} dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: "0.3rem" }} />);
    } else if (line.trim()) {
      const content = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      elements.push(
        <p key={key++} style={{ fontSize: "0.88rem", lineHeight: 1.75, color: "#444", marginBottom: "0.3rem" }} dangerouslySetInnerHTML={{ __html: content }} />
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
    width: "100%", background: "#fff",
    border: "1.5px solid #e0e0e0", borderRadius: "10px",
    padding: "0.85rem 1rem", color: "#111", fontSize: "0.9rem",
    outline: "none", fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const darkBtn = {
    width: "100%", border: "none", borderRadius: "10px", padding: "1rem",
    background: "#111", color: "#fff", fontSize: "0.85rem", fontWeight: 700,
    cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
    transition: "opacity 0.2s",
  };

  const disabledBtn = { ...darkBtn, background: "#e8e8e8", color: "#aaa", cursor: "not-allowed" };

  const stepIndicator = (current) => {
    const steps = ["select", "intake", "details"];
    const idx = steps.indexOf(current);
    if (idx === -1) return null;
    return (
      <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "2rem" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ width: i === idx ? "24px" : "6px", height: "6px", borderRadius: "3px", background: i <= idx ? "#111" : "#ddd", transition: "all 0.3s" }} />
        ))}
      </div>
    );
  };

  return (
    <div ref={topRef} style={{ minHeight: "100vh", background: "#f5f5f3", fontFamily: "'DM Sans', sans-serif", color: "#111" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .card:hover { border-color: #111 !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
        .card { transition: all 0.2s ease; }
        input:focus, textarea:focus { border-color: #111 !important; box-shadow: 0 0 0 3px rgba(0,0,0,0.06) !important; }
      `}</style>

      <div style={{ background: "#111", color: "#fff", padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>LifeHAUL</span>
          <span style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500 }}>AI Transition Guide</span>
        </div>
        {step !== "select" && step !== "loading" && (
          <button onClick={reset} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: "0.75rem", padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            Start Over
          </button>
        )}
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "2rem 1.25rem 5rem", animation: "fadeUp 0.4s ease" }}>

        {step === "select" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 400, margin: "0 0 0.5rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                What are you navigating?
              </h1>
              <p style={{ color: "#777", fontSize: "0.88rem", margin: 0 }}>
                Select your life transition to get a personalized action plan.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.65rem" }}>
              {TRANSITIONS.map(t => (
                <button key={t.id} className="card" onClick={() => { setSelected(t.id); setStep("intake"); }}
                  style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: "12px", padding: "1rem", cursor: "pointer", textAlign: "left", color: "#111", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{t.icon}</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.2rem" }}>{t.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#999", lineHeight: 1.4 }}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "intake" && (
          <div>
            {stepIndicator("intake")}
            <div style={{ background: "#111", borderRadius: "14px", padding: "1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "1.8rem" }}>{selectedTransition?.icon}</span>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Selected Transition</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "#fff" }}>{selectedTransition?.label}</div>
              </div>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>Tell us about yourself</h2>
            <p style={{ color: "#888", fontSize: "0.82rem", marginBottom: "1.75rem" }}>We'll use this to personalize your plan.</p>
            {[
              { key: "name", label: "Full Name", placeholder: "John Smith", type: "text" },
              { key: "phone", label: "Phone Number", placeholder: "(555) 000-0000", type: "tel" },
              { key: "email", label: "Email Address", placeholder: "john@email.com", type: "email" },
              { key: "location", label: "City & State", placeholder: "Saint Joseph, MI", type: "text" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: "1.1rem" }}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#111", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={intake[f.key]}
                  onChange={e => setIntake(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle} />
              </div>
            ))}
            <p style={{ fontSize: "0.7rem", color: "#bbb", marginBottom: "1.25rem" }}>🔒 Private and never shared.</p>
            <button onClick={() => setStep("details")} disabled={!intakeComplete} style={intakeComplete ? darkBtn : disabledBtn}>
              Continue →
            </button>
          </div>
        )}

        {step === "details" && (
          <div>
            {stepIndicator("details")}
            <div style={{ background: "#111", borderRadius: "14px", padding: "1.25rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "1.8rem" }}>{selectedTransition?.icon}</span>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.2rem" }}>Selected Transition</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "#fff" }}>{selectedTransition?.label}</div>
              </div>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>Describe your situation</h2>
            <p style={{ color: "#888", fontSize: "0.82rem", marginBottom: "1.25rem" }}>The more detail you share, the more specific your plan will be.</p>
            <textarea value={details} onChange={e => setDetails(e.target.value)} rows={7}
              placeholder="What's happening, when is it happening, and what concerns you most?"
              style={{ ...inputStyle, lineHeight: 1.7, resize: "vertical" }} />
            {error && (
              <div style={{ background: "#fff0f0", border: "1.5px solid #ffd0d0", borderRadius: "8px", padding: "0.75rem", marginTop: "0.75rem" }}>
                <p style={{ color: "#c00", fontSize: "0.78rem", margin: 0 }}>{error}</p>
              </div>
            )}
            <button onClick={handleGenerate} disabled={!details.trim()} style={{ ...(details.trim() ? darkBtn : disabledBtn), marginTop: "1rem" }}>
              Generate My Plan →
            </button>
          </div>
        )}

        {step === "loading" && (
          <div style={{ textAlign: "center", padding: "6rem 1rem" }}>
            <div style={{ width: "36px", height: "36px", border: "2.5px solid #e0e0e0", borderTop: "2.5px solid #111", borderRadius: "50%", margin: "0 auto 2rem", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem", fontWeight: 400, color: "#111", marginBottom: "0.4rem" }}>Building your plan...</p>
            <p style={{ fontSize: "0.78rem", color: "#999" }}>Analyzing your transition across every area of life</p>
          </div>
        )}

        {step === "result" && (
          <div>
            <div style={{ background: "#111", borderRadius: "14px", padding: "1.5rem", marginBottom: "2rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Personalized Plan for</div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.4rem", color: "#fff", marginBottom: "0.2rem" }}>{intake.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#666" }}>{selectedTransition?.icon} {selectedTransition?.label} · {intake.location}</div>
            </div>
            <div style={{ background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: "14px", padding: "1.75rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              {parseMarkdown(plan)}
            </div>
            <div style={{ marginTop: "1.5rem", background: "#111", borderRadius: "14px", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.3rem" }}>Moving? We've got you.</div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.1rem", color: "#fff" }}>HE-HAULS LLC</div>
                <div style={{ fontSize: "0.72rem", color: "#666", marginTop: "0.15rem" }}>Local · Long-distance · Packing · hehauls.com</div>
              </div>
              <a href="https://hehauls.com" style={{ background: "#fff", color: "#111", padding: "0.6rem 1.2rem", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                Get a Quote →
              </a>
            </div>
            <button onClick={reset} style={{ ...darkBtn, marginTop: "1rem", background: "#f0f0f0", color: "#111" }}>
              Start a New Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
