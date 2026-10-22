import { useState } from "react";
import ShapeWaves from "./ShapeWaves";
import GraphWorkspace from "./GraphWorkspace";

const examples = [
  { label: "Expense Tracker", url: "https://github.com/Fardeeenn/expense-tracker" },
  { label: "FastAPI", url: "https://github.com/fastapi/fastapi" },
  { label: "Requests", url: "https://github.com/psf/requests" },
];

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showWorkspace, setShowWorkspace] = useState(false);
  
  async function handleAnalyze(event) {
    event.preventDefault();

    const url = repoUrl.trim();

    if (!url) {
      setMessage("Enter a GitHub repository URL to get started.");
      return;
    }

    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(url)) {
      setMessage("Enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/repositories/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail || data)
        );
      }

      setResult(data);
      setShowWorkspace(true);
      setMessage("");
    } catch (error) {
      setMessage(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (showWorkspace && result) {
    return (
      <GraphWorkspace
        result={result}
        onBack={() => setShowWorkspace(false)}
     />
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        button, input { font: inherit; }
        button { transition: background 160ms ease, border-color 160ms ease, transform 160ms ease; }
        button:hover { filter: brightness(1.12); }
        a { color: inherit; text-decoration: none; }
        .nav-link:hover { color: #E6EDF3 !important; }
        .analyze-button:hover { background: #2EA043 !important; }
        .example-chip:hover { background: #21262D !important; border-color: #58A6FF !important; }
        .repo-input:focus { outline: none; }
        @media (max-width: 600px) {
          .hero-title { font-size: 40px !important; }
          .repo-form { flex-direction: column; }
          .analyze-button { min-height: 48px; }
          .nav-links { display: none !important; }
          .hero { padding-top: 72px !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <header style={styles.navbar}>
        <a href="#" style={styles.brand}>
          <div style={styles.brandMark}>
            <svg viewBox="0 0 24 24" width="23" height="23" fill="currentColor" aria-hidden="true">
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.51-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.04 3.17 1.46.1-.72.4-1.21.69-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.23-5.1 5.51.4.35.74 1.03.74 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
          </div>
          <span>RepoPilot</span>
          <span style={styles.betaTag}>BETA</span>
        </a>

        <nav className="nav-links" style={styles.navLinks}>
          <a className="nav-link" href="#features" style={styles.navLink}>Features</a>
          <a className="nav-link" href="#how-it-works" style={styles.navLink}>How it works</a>
          <a className="nav-link" href="https://github.com" target="_blank" rel="noreferrer" style={styles.navLink}>GitHub ↗</a>
        </nav>

        <a href="#analyze" style={styles.navButton}>Get started <span>→</span></a>
      </header>

      <main>
        <section className="hero" id="analyze" style={styles.hero}>
          <div className="hero-animation">
            <ShapeWaves
              text=" "
              fontFamily="monospace"
              fontWeight={700}
              textSize={0.6}
              shapes="mixed"
              cellSize={10}
              dotSize={0.75}
              color="#929292"
              hoverColor="#ffffff"
              backgroundColor="#0D1117"
              speed={1}
              scale={1}
              contrast={1}
              brightness={0.4}
              flow={0}
              direction={0}
              fade={0.25}
              interactive
              splashRadius={40}
              splashStrength={0.4}
              glow={0.35}
              intro
              introDuration={1.6}
              paused={false}
              />
          </div>

          <div style={styles.ambientGlow} />

          <div style={styles.eyebrow}>
            <span style={styles.liveDot} />
            YOUR REPOSITORY, DECODED
          </div>

          <h1 className="hero-title" style={styles.heroTitle}>
            See how your code
            <br />
            <span style={styles.gradientText}>connects.</span>
          </h1>

          <p style={styles.heroDescription}>
            Turn any GitHub repository into a clear map of its code structure,
            functions, imports, and connections.
          </p>

          <form className="repo-form" onSubmit={handleAnalyze} style={styles.repoForm}>
            <div style={styles.inputIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
              </svg>
            </div>

            <input
              className="repo-input"
              value={repoUrl}
              onChange={(event) => {
                setRepoUrl(event.target.value);
                setMessage("");
              }}
              placeholder="Paste a GitHub repository URL..."
              aria-label="GitHub repository URL"
              style={styles.repoInput}
            />

            <button className="analyze-button" type="submit" style={styles.analyzeButton}>
              Analyze repository <span aria-hidden="true">→</span>
            </button>
          </form>

          {message && <p role="status" style={styles.statusMessage}>{message}</p>}

          <div style={styles.examples}>
            <span style={styles.examplesLabel}>TRY AN EXAMPLE</span>
            {examples.map((example) => (
              <button
                className="example-chip"
                key={example.label}
                type="button"
                onClick={() => {
                  setRepoUrl(example.url);
                  setMessage("");
                }}
                style={styles.exampleChip}
              >
                <span style={{ color: "#8B949E" }}>↗</span>
                {example.label}
              </button>
            ))}
          </div>
        </section>

        <section id="features" style={styles.featuresSection}>
          <div style={styles.sectionHeading}>
            <span style={styles.sectionEyebrow}>BUILT FOR DEVELOPERS</span>
            <h2 style={styles.sectionTitle}>From codebase to clarity.</h2>
            <p style={styles.sectionDescription}>
              Get a useful overview of a repository without manually tracing every file.
            </p>
          </div>

          <div className="feature-grid" style={styles.featureGrid}>
            <FeatureCard
              number="01"
              icon="⌘"
              title="Explore code structure"
              description="See the files, classes, and functions that make up a Python project."
              accent="#58A6FF"
            />
            <FeatureCard
              number="02"
              icon="↗"
              title="Trace connections"
              description="Understand function calls and how different parts of your code connect."
              accent="#D2A8FF"
            />
            <FeatureCard
              number="03"
              icon="⌕"
              title="Spot key details"
              description="Inspect imports, syntax errors, and useful repository-level statistics."
              accent="#3FB950"
            />
          </div>
        </section>

        <section id="how-it-works" style={styles.workflowSection}>
          <span style={styles.sectionEyebrow}>A SIMPLE WORKFLOW</span>
          <h2 style={styles.sectionTitle}>Three steps to understanding.</h2>
          <div style={styles.workflowSteps}>
            {[
              ["01", "Paste a repository URL", "Choose a public GitHub repository."],
              ["02", "Let RepoPilot analyze", "The backend inspects supported source files."],
              ["03", "Explore the results", "Review code structure and relationships."],
            ].map(([number, title, description], index) => (
              <div key={number} style={styles.workflowStep}>
                <div style={styles.stepNumber}>{number}</div>
                <div>
                  <h3 style={styles.stepTitle}>{title}</h3>
                  <p style={styles.stepDescription}>{description}</p>
                </div>
                {index < 2 && <div className="step-connector" style={styles.stepConnector} />}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <a href="#" style={styles.brand}>
          <div style={{ ...styles.brandMark, width: 28, height: 28 }}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.51-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.75 2.04 3.17 1.46.1-.72.4-1.21.69-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.29-2.61 5.23-5.1 5.51.4.35.74 1.03.74 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
          </div>
          <span>RepoPilot</span>
        </a>
        <span style={styles.footerText}>Built to make codebases easier to understand.</span>
        <span style={styles.footerText}>© 2026 RepoPilot</span>
      </footer>
    </div>
  );
}


function FeatureCard({ number, icon, title, description, accent }) {
  return (
    <article
      className="feature-card"
      style={{
        ...styles.featureCard,
        "--card-accent": accent,
      }}
    >
      <div style={styles.featureCardTop}>
        <span
          style={{
            ...styles.featureIcon,
            color: accent,
            borderColor: `${accent}35`,
            background: `${accent}10`,
          }}
        >
          {icon}
        </span>
        <span style={styles.featureNumber}>{number}</span>
      </div>

      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDescription}>{description}</p>
    </article>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0D1117",
    color: "#E6EDF3",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    overflow: "hidden",
  },
  navbar: {
    height: "76px",
    padding: "0 clamp(20px, 6vw, 88px)",
    borderBottom: "1px solid #21262D",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    background: "rgba(13, 17, 23, 0.94)",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.4px", whiteSpace: "nowrap" },
  brandMark: { width: 34, height: 34, borderRadius: "10px", background: "#21262D", border: "1px solid #30363D", display: "grid", placeItems: "center", color: "#E6EDF3" },
  betaTag: { fontSize: "9px", letterSpacing: "1px", color: "#8B949E", border: "1px solid #30363D", borderRadius: "5px", padding: "3px 5px", marginLeft: "2px" },
  navLinks: { display: "flex", alignItems: "center", gap: "32px" },
  navLink: { color: "#8B949E", fontSize: "13px", transition: "color 160ms ease" },
  navButton: { padding: "10px 15px", border: "1px solid #30363D", borderRadius: "8px", fontSize: "13px", fontWeight: 600, display: "flex", gap: "10px", alignItems: "center", whiteSpace: "nowrap" },
  hero: { position: "relative", textAlign: "center", padding: "112px 32px 92px", width: "100%", maxWidth: "none", margin: "0", boxSizing: "border-box" },
  ambientGlow: { position: "absolute", zIndex: 0, width: "700px", height: "350px", top: "25px", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(ellipse, rgba(56, 139, 253, 0.13) 0%, rgba(88, 166, 255, 0.035) 42%, transparent 72%)", pointerEvents: "none" },
  eyebrow: { position: "relative", display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 14px", border: "1px solid #30363D", borderRadius: "999px", color: "#C9D1D9", fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", background: "rgba(13, 17, 23, 0.96)", textTransform: "uppercase", },
  liveDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#3FB950", boxShadow: "0 0 12px rgba(63, 185, 80, 0.5)" },
  heroTitle: { position: "relative", fontSize: "clamp(42px, 5.4vw, 68px)", lineHeight: 1.12, letterSpacing: "-3px", fontWeight: 750, margin: "0 auto 28px", maxWidth: "900px", color: "#F0F6FC", textShadow: "0 2px 18px rgba(0, 0, 0, 0.75)" },
  gradientText: { color: "#F0F6FC", background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "#F0F6FC", filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.7))" },
  heroDescription: { position: "relative", maxWidth: "610px", margin: "0 auto", color: "#E6EDF3", fontSize: "16px", lineHeight: 1.85, textShadow: "0 1px 8px rgba(0, 0, 0, 0.95)" },
  repoForm: { position: "relative", display: "flex", alignItems: "center", gap: "10px", maxWidth: "720px", margin: "42px auto 0", padding: "8px", borderRadius: "13px", border: "1px solid #3D444D", background: "rgba(22, 27, 34, 0.95)", boxShadow: "0 12px 45px rgba(0,0,0,.2), 0 0 0 4px rgba(88,166,255,.025)" },
  inputIcon: { color: "#6E7681", paddingLeft: "12px", display: "flex", flexShrink: 0 },
  repoInput: { flex: 1, minWidth: 0, padding: "14px 8px", border: "none", outline: "none", background: "transparent", color: "#E6EDF3", fontSize: "14px" },
  analyzeButton: { border: "1px solid rgba(240,246,252,.1)", borderRadius: "8px", padding: "14px 18px", background: "#238636", color: "#FFFFFF", fontWeight: 650, fontSize: "13px", display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", cursor: "pointer" },
  statusMessage: { color: "#F0B849", fontSize: "13px", marginTop: "18px" },
  inputHint: { display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", color: "#f0f6fc", fontSize: "12px", fontWeight: 500, textShadow: "0 1px 6px rgba(0, 0, 0, 0.95)" },
  hintDivider: { color: "#8b949e" },
  examples: { marginTop: "38px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  examplesLabel: { color: "#ffffff", fontSize: "10px", fontWeight: 800, letterSpacing: "1.3px", marginRight: "8px", padding: "8px 12px", borderRadius: "6px", background: "rgba(13, 17, 23, 0.92)", border: "1px solid rgba(255, 255, 255, 0.18)", textShadow: "0 0 8px rgba(255, 255, 255, 0.7)", boxShadow: "0 0 12px rgba(255, 255, 255, 0.08)",},
  exampleChip: { display: "flex", alignItems: "center", gap: "8px", border: "1px solid rgba(220, 235, 255, 0.22)", background: "rgba(255, 255, 255, 0.07)", color: "#F0F6FC", borderRadius: "12px", padding: "10px 14px", fontSize: "12px", textShadow: "0 1px 6px rgba(0, 0, 0, 0.5)", backdropFilter: "blur(14px) saturate(140%)", WebkitBackdropFilter: "blur(14px) saturate(140%)", boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 4px 16px rgba(0, 0, 0, 0.16)"},
  featuresSection: { borderTop: "1px solid #21262D", background: "#0D1117", padding: "78px 24px 88px" },
  sectionHeading: { textAlign: "center", marginBottom: "42px" },
  sectionEyebrow: { color: "#58A6FF", fontSize: "10px", fontWeight: 750, letterSpacing: "1.8px" },
  sectionTitle: { fontSize: "clamp(27px, 3vw, 36px)", letterSpacing: "-1.1px", margin: "14px 0 12px", fontWeight: 650 },
  sectionDescription: { margin: "0 auto", maxWidth: "540px", fontSize: "14px", lineHeight: 1.8, color: "#8B949E" },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px", maxWidth: "1000px", margin: "0 auto" },
  featureCard: { position: "relative", minHeight: "205px", overflow: "hidden", padding: "25px", border: "1px solid #30363D", borderRadius: "12px", background: "linear-gradient(145deg, #161B22 0%, #11161D 100%)" },
  featureCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
  featureIcon: { width: "39px", height: "39px", border: "1px solid", borderRadius: "10px", display: "grid", placeItems: "center", fontSize: "21px" },
  featureNumber: { fontSize: "11px", color: "#6E7681", fontVariantNumeric: "tabular-nums" },
  featureTitle: { fontSize: "16px", margin: "0 0 10px", fontWeight: 650, letterSpacing: "-.2px" },
  featureDescription: { color: "#8B949E", fontSize: "13px", lineHeight: 1.8, margin: 0 },
  featureAccent: { position: "absolute", height: "2px", bottom: 0, left: "25px", right: "25px", opacity: 0.65 },
  workflowSection: { borderTop: "1px solid #21262D", padding: "75px 24px 90px", textAlign: "center", background: "#0B0F14" },
  workflowSteps: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "28px", maxWidth: "960px", margin: "45px auto 0", textAlign: "left" },
  workflowStep: { position: "relative", display: "flex", gap: "15px", alignItems: "flex-start" },
  stepNumber: { width: "38px", height: "38px", border: "1px solid #30363D", background: "#161B22", borderRadius: "10px", display: "grid", placeItems: "center", flexShrink: 0, color: "#58A6FF", fontSize: "12px", fontWeight: 700 },
  stepTitle: { fontSize: "14px", fontWeight: 650, margin: "3px 0 8px" },
  stepDescription: { fontSize: "12px", lineHeight: 1.75, color: "#8B949E", margin: 0 },
  stepConnector: { position: "absolute", width: "25px", height: "1px", background: "#30363D", top: "19px", right: "-27px" },
  footer: { minHeight: "85px", padding: "20px clamp(20px, 6vw, 88px)", borderTop: "1px solid #21262D", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "18px", background: "#0D1117" },
  footerText: { color: "#6E7681", fontSize: "11px" },
};

export default App;