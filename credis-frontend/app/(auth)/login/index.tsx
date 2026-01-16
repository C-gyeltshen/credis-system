import React, { useState } from "react";
import { Phone, AlertCircle, Check, ArrowRight, UserPlus } from "lucide-react";

type Errors = {
  phoneNumber?: string;
  password?: string;
  submit?: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

interface FormData {
  phoneNumber: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: "",
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
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    wrapper: {
      width: "100%",
      maxWidth: "500px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    tabContainer: {
      display: "flex",
      gap: "12px",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "8px",
      borderRadius: "12px",
      backdropFilter: "blur(10px)",
    },
    tab: {
      flex: 1,
      padding: "12px 16px",
      border: "none",
      borderRadius: "8px",
      fontSize: "15px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backgroundColor: "transparent",
      color: "#6b7280",
    },
    tabActive: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      gap: "28px",
      animation: "fadeIn 0.4s ease",
    },
    header: {
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
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
    } as React.CSSProperties,
    inputError: {
      borderColor: "#fca5a5",
      backgroundColor: "#fef2f2",
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
    infoBox: {
      backgroundColor: "#dbeafe",
      border: "1px solid #93c5fd",
      borderRadius: "8px",
      padding: "12px 16px",
      fontSize: "13px",
      color: "#1e40af",
      display: "flex",
      gap: "8px",
    },
    trustBadges: {
      marginTop: "8px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "24px",
      fontSize: "12px",
      color: "#6b7280",
    },
    onboardingSection: {
      backgroundColor: "#f0f9ff",
      border: "2px solid #93c5fd",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
    },
    onboardingIcon: {
      fontSize: "40px",
      marginBottom: "12px",
    },
    onboardingTitle: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#1e40af",
      marginBottom: "8px",
    },
    onboardingText: {
      fontSize: "14px",
      color: "#1e40af",
      marginBottom: "16px",
      lineHeight: "1.5",
    },
    registerBtn: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
  };

  const [activeTab, setActiveTab] = useState<"login" | "new">("login");

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9\-\s()]{7,15}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.password) {
      newErrors.password = "PIN is required";
    } else if (!/^\d{4}$/.test(formData.password)) {
      newErrors.password = "PIN must be exactly 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/store-owners/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Login successful", data.user);
        window.location.href = "/customer-dashboard";
      } else {
        const errorMessage = data.error || "Login failed. Please try again.";
        setErrors({ submit: errorMessage });
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      let message =
        "Connection failed. Please check your internet and try again.";
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    let finalValue = value;

    if (field === "password") {
      finalValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [field]: finalValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input:focus {
          outline: none;
          border-color: #2563eb !important;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          .tab-container {
            gap: 8px;
          }
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Tab Navigation */}
        <div style={styles.tabContainer} className="tab-container">
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "login" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("login")}
          >
            Sign In
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "new" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("new")}
          >
            New to Credis?
          </button>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          {activeTab === "login" ? (
            <>
              {/* Header */}
              <div style={styles.header}>
                <h1 style={styles.headerTitle}>Welcome Back</h1>
                <p style={styles.headerSubtitle}>
                  Sign in to your Credis account
                </p>
              </div>

              {/* Error Alert */}
              {errors.submit && (
                <div style={styles.errorAlert}>
                  <AlertCircle size={20} style={{ flexShrink: 0 }} />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Info Box */}
              <div style={styles.infoBox}>
                <span>ℹ️</span>
                <span>Not registeered ? Click "New to Credis?" above</span>
              </div>

              {/* Form */}
              <div style={styles.formContainer}>
                {/* Phone Number Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Phone Number
                  </label>
                  <div style={styles.inputWrapper}>
                    <div style={styles.icon}>
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      disabled={loading}
                      style={{
                        ...styles.input,
                        ...(errors.phoneNumber ? styles.inputError : {}),
                        ...(loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
                      }}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={16} />
                      {errors.phoneNumber}
                    </div>
                  )}
                </div>

                {/* PIN Field */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>PIN (4 Digits)</label>
                  <div style={{
                    display: "flex",
                    gap: "clamp(8px, 3%, 16px)",
                    justifyContent: "space-between",
                  }}>
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        type="password"
                        value={formData.password[index] || ""}
                        onChange={(e) => {
                          const newPassword = formData.password.split("");
                          newPassword[index] = e.target.value.replace(/[^0-9]/g, "");
                          const updatedPassword = newPassword.slice(0, 4).join("");
                          handleInputChange("password", updatedPassword);

                          if (
                            e.target.value &&
                            index < 3
                          ) {
                            const nextInput = document.querySelector(
                              `input[data-pin-index="${index + 1}"]`
                            ) as HTMLInputElement;
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Backspace" &&
                            !formData.password[index] &&
                            index > 0
                          ) {
                            const prevInput = document.querySelector(
                              `input[data-pin-index="${index - 1}"]`
                            ) as HTMLInputElement;
                            prevInput?.focus();
                          }
                        }}
                        disabled={loading}
                        maxLength={1}
                        inputMode="numeric"
                        data-pin-index={index}
                        placeholder="•"
                        style={{
                          flex: 1,
                          minWidth: 0,
                          aspectRatio: "1 / 1",
                          maxWidth: "80px",
                          borderRadius: "12px",
                          border: errors.password
                            ? "2px solid #fca5a5"
                            : "2px solid #e5e7eb",
                          backgroundColor: errors.password ? "#fef2f2" : "#f9fafb",
                          fontSize: "clamp(16px, 5vw, 28px)",
                          fontWeight: "600",
                          textAlign: "center",
                          color: "#111827",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          cursor: loading ? "not-allowed" : "text",
                          opacity: loading ? 0.6 : 1,
                        }}
                      />
                    ))}
                  </div>
                  {errors.password && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={16} />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Remember Me */}
                <label style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    style={{ display: "none" }}
                    disabled={loading}
                    aria-label="Remember me"
                  />
                  <div
                    style={{
                      ...styles.checkbox,
                      ...(rememberMe ? styles.checkboxChecked : {}),
                      ...(loading ? { opacity: 0.6, cursor: "not-allowed" } : {}),
                    }}
                  >
                    {rememberMe && <Check size={14} color="#ffffff" />}
                  </div>
                  <span style={styles.checkboxText}>Remember me</span>
                </label>

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
            </>
          ) : (
            <>
              {/* New User Section */}
              <div style={styles.onboardingSection}>
                <div style={styles.onboardingIcon}>🚀</div>
                <h2 style={styles.onboardingTitle}>Ready to Get Started?</h2>
                <p style={styles.onboardingText}>
                  Join Credis today and start managing your credit more efficiently. 
                  Registration takes just a few minutes!
                </p>
              </div>

              {/* Features */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}>
                <div style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#111827", fontSize: "14px" }}>
                      Easy Setup
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      Register in minutes with basic info
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#111827", fontSize: "14px" }}>
                      Secure & Safe
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      Your data is encrypted and protected
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: "600", color: "#111827", fontSize: "14px" }}>
                      Instant Access
                    </div>
                    <div style={{ fontSize: "13px", color: "#6b7280" }}>
                      Start using Credis immediately after registration
                    </div>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={() => {
                  globalThis.location.href = "/register";
                }}
                style={styles.registerBtn}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.target as HTMLButtonElement).style.boxShadow =
                    "0 10px 15px -3px rgba(16, 185, 129, 0.3)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.target as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <UserPlus size={20} />
                Create Account
                <ArrowRight size={18} />
              </button>
            </>
          )}

          {/* Trust Badges */}
          <div style={styles.trustBadges}>
            <span>🔒 Secure</span>
            <span>⚡ Fast</span>
            <span>✨ Simple</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;