import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, AlertCircle } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("signin"); // 'signin' | 'signup'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // New user, create profile
        await setDoc(docRef, {
          name: user.displayName || "",
          email: user.email,
          avatar: user.photoURL || "",
          created_at: new Date().toISOString()
        });
      }
      
      navigate("/discover");
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: name.trim(),
          email: email,
          created_at: new Date().toISOString()
        });
      }
      navigate("/discover");
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")) {
        setError("Wrong email or password. Try again.");
      } else if (msg.includes("auth/email-already-in-use")) {
        setError("An account with this email already exists. Sign in instead.");
      } else if (msg.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "transparent",
    border: "1.5px solid var(--border-medium)",
    borderRadius: 10,
    fontSize: "0.9375rem",
    color: "var(--text-primary)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div
      style={{
        height: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        position: "relative",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "0 40px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          background: "var(--bg)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <span
            style={{
              fontFamily: "var(--font-logo)",
              fontWeight: 800,
              fontSize: "1.75rem",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Perenti
          </span>
        </div>
        <button
          className="btn btn-ghost"
          style={{ fontSize: "0.875rem", padding: "6px 14px" }}
          onClick={() => navigate("/")}
        >
          Back to home
        </button>
      </header>

      {/* Main — 2-col split */}
      <div
        className="login-grid"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "420px 1fr",
          minHeight: 0,
        }}
      >
        {/* Left — Auth Form */}
        <div
          className="login-form-col"
          style={{
            padding: "48px 40px",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-logo)",
              fontSize: "2.5rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--primary)",
              marginBottom: 24,
            }}
          >
            Perenti
          </div>

          {/* Tab switcher */}
          <div
            style={{
              display: "flex",
              gap: 0,
              marginBottom: 32,
              borderBottom: "1px solid var(--border)",
            }}
          >
            {[
              ["signin", "Sign In"],
              ["signup", "Create Account"],
            ].map(([t, label]) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "none",
                  border: "none",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.9375rem",
                  fontWeight: tab === t ? 700 : 500,
                  color: tab === t ? "var(--primary)" : "var(--text-secondary)",
                  borderBottom:
                    tab === t
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  marginBottom: -1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 500,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: 28,
              lineHeight: 1.2,
            }}
          >
            {tab === "signin" ? "Welcome back." : "Join Perenti."}
          </h1>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "rgba(242,87,48,0.08)",
                border: "1px solid rgba(242,87,48,0.25)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                fontSize: "0.875rem",
                color: "var(--red)",
                lineHeight: 1.5,
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {tab === "signup" && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--border-medium)")
                }
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-medium)")
              }
            />
            <input
              type="password"
              placeholder={
                tab === "signup" ? "Password (min 8 chars)" : "Password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--primary)")}
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--border-medium)")
              }
            />
            {tab === "signin" && (
              <div style={{ textAlign: "right", marginTop: "-4px" }}>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--primary)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </Link>
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: 10,
                justifyContent: "center",
                marginTop: 4,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? "Please wait…"
                : tab === "signin"
                  ? "Sign In"
                  : "Create Account"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
            <span style={{ margin: '0 12px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>OR</span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'var(--border)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "1rem",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: "var(--bg-elevated)",
              border: "1.5px solid var(--border-medium)",
              color: "var(--text-primary)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.borderColor = "var(--primary)" }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.borderColor = "var(--border-medium)" }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-tertiary)",
              marginTop: 28,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            By continuing, you agree to Perenti's{" "}
            <span style={{ color: "var(--primary)", cursor: "pointer" }}>
              Terms of Service
            </span>{" "}
            and{" "}
            <span style={{ color: "var(--primary)", cursor: "pointer" }}>
              Privacy Policy
            </span>
            .
          </p>
        </div>

        {/* Right — Info panel */}
        <div
          className="login-right-panel"
          style={{
            padding: "56px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "20%",
              right: "-10%",
              width: "50%",
              height: "60%",
              background:
                "radial-gradient(ellipse, rgba(3,212,124,0.08) 0%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", zIndex: 1, maxWidth: 520 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Perenti Smart Events, Seamless Outcomes
            </div>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
                fontWeight: 500,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
                marginBottom: 24,
                lineHeight: 1.15,
              }}
            >
              Hyderabad's most
              <br />
              curated professional
              <br />
              community.
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              Verified founders, investors, and builders. Sign in to browse the
              full directory, register for meetups, and connect with real
              people.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { n: "120+", l: "Verified Members" },
                { n: "28+", l: "Meetups Hosted" },
                { n: "48h", l: "Avg. Application Review" },
              ].map((s) => (
                <div
                  key={s.l}
                  style={{ display: "flex", alignItems: "center", gap: 20 }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: "var(--primary)",
                      minWidth: 60,
                    }}
                  >
                    {s.n}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9375rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Giant Watermark */}
      <div
        style={{
          textAlign: "center",
          overflow: "hidden",
          lineHeight: 0.75,
          userSelect: "none",
          pointerEvents: "none",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            fontSize: "clamp(120px, 28vw, 420px)",
            fontWeight: 800,
            fontFamily: "var(--font-logo)",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            opacity: 0.03,
            display: "block",
            transform: "translateY(15%)",
          }}
        >
          Perenti
        </span>
      </div>
    </div>
  );
}
