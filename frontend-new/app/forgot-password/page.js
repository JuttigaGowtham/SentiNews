"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { forgotPassword } from "@/lib/api";
import { TrendingUp } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const res = await forgotPassword(email);
            setMessage(res.message);
        } catch (err) {
            setError(err.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo Section */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
                    <div 
                        className="auth-social-pill" 
                        onClick={() => router.push("/")} 
                        style={{ 
                            cursor: "pointer", 
                            width: "100%", 
                            justifyContent: "center", 
                            padding: "0.9rem 1.5rem",
                            background: "var(--bg-elevated)",
                            borderColor: "var(--border-subtle)",
                            fontWeight: "1000",
                            fontSize: "1.5rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.15em"
                        }}
                    >
                        <span className="brand-logo-badge-text">SENTINEWS</span>
                    </div>
                </div>

                <div className="auth-form-content-new" style={{ margin: "0" }}>
                    <h2 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Reset password</h2>
                    <p className="subtitle" style={{ textAlign: "center", marginBottom: "2rem", color: "var(--neon-light-blue)", opacity: 0.85 }}>
                        Enter your email and we'll send you a link to reset your password.
                    </p>

                    {message ? (
                        <div style={{ textAlign: "center", marginTop: "1rem" }}>
                            <div style={{ color: "var(--neon-teal)", padding: "0.9rem 1.5rem", background: "rgba(0, 212, 180, 0.08)", border: "1px solid rgba(0, 212, 180, 0.2)", borderRadius: "99px", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                                {message}
                            </div>
                            <button type="button" className="auth-btn-pill" style={{ width: "100%" }} onClick={() => router.push("/login")}>
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="auth-field-group-new">
                                <label className="auth-field-label-new">Email</label>
                                <input
                                    type="email"
                                    className="auth-input-pill"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="auth-error-msg" style={{ marginTop: "1rem", borderRadius: "99px", padding: "0.75rem 1.5rem" }}>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button className="auth-btn-pill" type="submit" disabled={loading} style={{ marginTop: "1.5rem" }}>
                                {loading ? "Sending..." : "Send reset link"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="auth-footer-new" style={{ marginTop: "2rem", justifyContent: "center" }}>
                    <button
                        type="button"
                        className="auth-footer-new-link"
                        onClick={() => router.push("/login")}
                    >
                        Back to login
                    </button>
                </div>
            </div>
        </div>
    );
}
