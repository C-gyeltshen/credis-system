import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Check } from "lucide-react";

type Errors = {
  email?: string;
  password?: string;
  submit?: string;
};

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #f0f5ff 0%, #f0e8ff 50%, #ffe8f5 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    },
    wrapper: {
      width: "100%",
      maxWidth: "448px",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      gap: "28px",
    },
    header: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },
    logo: {
      fontSize: "40px",
      marginBottom: "8px",
    },
    headerTitle: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#111827",
      margin: 0,
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#6b7280",
      margin: 0,
    },
    formContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#374151",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    inputWrapper: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    input: {
      width: "100%",
      padding: "12px 16px 12px 44px",
      borderRadius: "8px",
      border: "2px solid #e5e7eb",
      backgroundColor: "#f9fafb",
      fontSize: "14px",
      color: "#111827",
      fontFamily: "inherit",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
    },
    inputError: {
      borderColor: "#fca5a5",
      backgroundColor: "#fef2f2",
    },
    inputFocus: {
      outline: "none",
      borderColor: "#2563eb",
      backgroundColor: "#fff",
    },
    icon: {
      position: "absolute",
      left: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#6b7280",
      pointerEvents: "none",
    },
    togglePassword: {
      position: "absolute",
      right: "12px",
      background: "none",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#6b7280",
      padding: "0",
      transition: "color 0.2s ease",
    },
    errorMessage: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "13px",
      color: "#dc2626",
    },
    optionsRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      flex: 1,
    },
    checkbox: {
      width: "18px",
      height: "18px",
      border: "2px solid #e5e7eb",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fafb",
      transition: "all 0.2s ease",
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: "#2563eb",
      borderColor: "#2563eb",
    },
    checkboxText: {
      fontSize: "14px",
      color: "#6b7280",
      userSelect: "none",
    },
    forgotLink: {
      fontSize: "14px",
      color: "#2563eb",
      fontWeight: "500",
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
    loginBtn: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    loginBtnDisabled: {
      opacity: "0.5",
      cursor: "not-allowed",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      color: "#d1d5db",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      backgroundColor: "#e5e7eb",
    },
    dividerText: {
      fontSize: "13px",
      color: "#9ca3af",
      fontWeight: "500",
    },
    socialButtons: {
      display: "flex",
      gap: "12px",
    },
    socialBtn: {
      flex: 1,
      padding: "10px 16px",
      border: "2px solid #e5e7eb",
      borderRadius: "8px",
      background: "#f9fafb",
      color: "#374151",
      fontWeight: "500",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    socialBtnHover: {
      borderColor: "#d1d5db",
      backgroundColor: "#f3f4f6",
    },
    footerLink: {
      textAlign: "center",
      fontSize: "14px",
      color: "#4b5563",
    },
    signUpLink: {
      color: "#2563eb",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "none",
      transition: "color 0.2s ease",
    },
    trustBadges: {
      marginTop: "24px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "24px",
      fontSize: "12px",
      color: "#6b7280",
    },
    errorAlert: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "14px",
      color: "#dc2626",
      backgroundColor: "#fef2f2",
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #fecaca",
    },
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/store-owners/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Store token and redirect
        console.log("Login successful", data);
        window.location.href = "/customer-dashboard";
      } else {
        setErrors({ submit: data.message || "Login failed" });
      }
    } catch (error: unknown) {
      let message = "Connection failed. Check your internet and try again.";
      if (error instanceof Error) {
        message = error.message || message;
      }
      setErrors({
        submit: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        input:focus {
          outline: none;
          border-color: #2563eb;
          background-color: #fff;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
      `}</style>

      <div style={styles.wrapper}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.logo}>👋</div>
            <h1 style={styles.headerTitle}>Welcome Back</h1>
            <p style={styles.headerSubtitle}>
              Sign in to manage your store and credit
            </p>
          </div>

          {/* Error Alert */}
          {errors.submit && (
            <div style={styles.errorAlert}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Form */}
          <div style={styles.formContainer}>
            {/* Email Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={16} style={{ color: "#2563eb" }} />
                Email Address
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.icon}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {}),
                  }}
                />
              </div>
              {errors.email && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={16} />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} style={{ color: "#16a34a" }} />
                Password
              </label>
              <div style={styles.inputWrapper}>
                <div style={styles.icon}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  style={{
                    ...styles.input,
                    ...(errors.password ? styles.inputError : {}),
                  }}
                />
                <button
                  style={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <div style={styles.errorMessage}>
                  <AlertCircle size={16} />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Options Row */}
            <div style={styles.optionsRow}>
              <label style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  style={{ display: "none" }}
                  aria-label="Remember me"
                />
                <div
                  style={{
                    ...styles.checkbox,
                    ...(rememberMe ? styles.checkboxChecked : {}),
                  }}
                >
                  {rememberMe && <Check size={14} color="#ffffff" />}
                </div>
                <span style={styles.checkboxText}>Remember me</span>
              </label>

              <button
                style={{
                  ...styles.forgotLink,
                  background: "none",
                  border: "none",
                  padding: 0,
                }}
                onClick={() => alert("Forgot password flow")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                ...styles.loginBtn,
                ...(loading ? styles.loginBtnDisabled : {}),
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!loading) {
                  (e.target as HTMLButtonElement).style.boxShadow =
                    "0 10px 15px -3px rgba(37, 99, 235, 0.3)";
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Social Buttons */}
          <div style={styles.socialButtons}>
            <button
              style={styles.socialBtn}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.borderColor = "#d1d5db";
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#f3f4f6";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.target as HTMLButtonElement).style.borderColor = "#e5e7eb";
                (e.target as HTMLButtonElement).style.backgroundColor =
                  "#f9fafb";
              }}
            >
              🔵 Google
            </button>
            <button
              style={styles.socialBtn}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                const target = e.target as HTMLButtonElement;
                target.style.borderColor = "#d1d5db";
                target.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                const target = e.target as HTMLButtonElement;
                target.style.borderColor = "#e5e7eb";
                target.style.backgroundColor = "#f9fafb";
              }}
            >
              🔵 Apple
            </button>
          </div>

          {/* Footer */}
          <div style={styles.footerLink}>
            Don't have an account?{" "}
            <button
              style={{
                ...styles.signUpLink,
                background: "none",
                border: "none",
                padding: 0,
              }}
              onClick={() => {
                window.location.href = "http://localhost:8081/register";
              }}
            >
              Create one
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={styles.trustBadges}>
          <span>🔒 Secure</span>
          <span>⚡ Fast</span>
          <span>✨ Simple</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
