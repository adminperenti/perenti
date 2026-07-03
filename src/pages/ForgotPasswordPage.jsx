import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Check your inbox for further instructions. (Also check your spam folder)");
    } catch (err) {
      if (
        err.code === "auth/user-not-found" ||
        err.message === "No account found with this email."
      ) {
        // For security, it's often better to show the same success message
        // but let's just show the exact error if desired or the generic one.
        setError("No account found with this email.");
      } else if (
        err.code === "auth/invalid-email" ||
        err.message === "Invalid email format."
      ) {
        setError("Invalid email format.");
      } else {
        setError(err.message || "Failed to send reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-medium)",
    borderRadius: 10,
    fontSize: "0.9375rem",
    color: "var(--text-primary)",
    outline: "none",
    transition: "all 0.2s ease",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          maxWidth: 1440,
          margin: "0 auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Left — Form */}
        <div
          className="login-left-panel"
          style={{
            flex: "1 1 50%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "40px clamp(20px, 8vw, 80px)",
            maxWidth: 640,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-logo)",
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              marginBottom: 40,
            }}
          >
            Perenti
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 500,
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.03em",
              color: "var(--text-primary)",
              marginBottom: 12,
              lineHeight: 1.2,
            }}
          >
            Reset Password
          </h1>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

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

          {message && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "rgba(3,212,124,0.08)",
                border: "1px solid rgba(3,212,124,0.25)",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                fontSize: "0.875rem",
                color: "var(--primary)",
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
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
              {loading ? "Sending..." : "Send Reset Link"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-secondary)",
              marginTop: 28,
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Remember your password?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Back to Login
            </Link>
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
            flex: "1 1 50%",
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
              Secure Access
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
              Get back to
              <br />
              connecting.
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                marginBottom: 40,
              }}
            >
              Reset your password securely to regain access to your Perenti account and never miss an event.
            </p>
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
          PERENTI
        </span>
      </div>
    </div>
  );
}
