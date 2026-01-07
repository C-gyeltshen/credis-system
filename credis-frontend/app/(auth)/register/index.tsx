import React, { useState } from "react";
import { Store, Lock, User, Phone, Eye, EyeOff, Check } from "lucide-react";

interface FormData {
  storeName: string;
  phoneNumber: string;
  ownerName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  storeName?: string;
  phoneNumber?: string;
  ownerName?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
}
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const RegisterScreen = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    phoneNumber: "",
    ownerName: "",
    password: "",
    confirmPassword: "",
  });

  const totalSteps = 2;
  const progressPercent = (step / totalSteps) * 100;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.storeName.trim()) {
        newErrors.storeName = "Store name is required";
      } else if (formData.storeName.trim().length < 2) {
        newErrors.storeName = "Store name must be at least 2 characters";
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^\+?[0-9\-\s()]{7,15}$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Enter a valid phone number";
      }
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = "Your name is required";
      } else if (formData.ownerName.trim().length < 2) {
        newErrors.ownerName = "Name must be at least 2 characters";
      }
    }

    if (currentStep === 2) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleRegister = async (): Promise<void> => {
    if (!validateStep(step)) return;

    setLoading(true);
    setErrors({});

    try {
      // Step 1: Create the store
      const storeResponse = await fetch(`${API_BASE_URL}/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.storeName,
          phone_number: formData.phoneNumber,
        }),
      });

      const storeData = await storeResponse.json();

      if (!storeResponse.ok || !storeData.data || !storeData.data.id) {
        setErrors({
          submit:
            storeData.error || "Failed to create store. Please try again.",
        });
        setLoading(false);
        return;
      }

      const storeId = storeData.data.id;

      // Step 2: Register the store owner with the storeId
      const registrationBody = {
        name: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        storeId: storeId,
      };
      console.log("Registering store owner with body:", registrationBody);

      const registrationResponse = await fetch(
        `${API_BASE_URL}/store-owners/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(registrationBody),
        }
      );
      console.log("response", registrationResponse);

      let registrationData = null;
      try {
        registrationData = await registrationResponse.json();
      } catch (e) {
        console.error("Failed to parse registration response as JSON", e);
      }

      if (!registrationResponse.ok) {
        console.error("Store owner registration failed", registrationData);
        setErrors({
          submit:
            (registrationData && registrationData.error) ||
            "Registration failed. Please try again.",
        });
        setLoading(false);
        return;
      }

      // Step 3: Auto-login after successful registration
      const loginResponse = await fetch(`${API_BASE_URL}/store-owners/login`, {
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

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setStep(5);
        return;
      }

      console.log("Registration and login successful:", loginData.user);
      setStep(5);
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        submit:
          "Connection failed. Please check your backend URL and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Success Screen
  if (step === 3) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f5ff 0%, #f0e8ff 50%, #ffe8f5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}>
        <div style={{ width: "100%", maxWidth: "448px" }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            alignItems: "center",
            textAlign: "center",
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4ade80 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Check size={32} color="#ffffff" />
            </div>

            <div>
              <h2 style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
                marginBottom: "8px",
              }}>Welcome to Your Store! 🎉</h2>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                margin: 0,
              }}>
                Your account is ready to go. Let's get you started!
              </p>
            </div>

            <button
              onClick={() => alert("Dashboard navigation would happen here")}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                color: "#ffffff",
                fontWeight: "600",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Go to Dashboard
            </button>
          </div>

          <div style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            fontSize: "12px",
            color: "#6b7280",
          }}>
            <span>🔒 Secure</span>
            <span>⚡ Quick</span>
            <span>✨ Easy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f5ff 0%, #f0e8ff 50%, #ffe8f5 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
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
          background-color: #fff !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        button:disabled {
          cursor: not-allowed;
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "448px" }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <h1 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
            }}>Start Your Store</h1>
            <span style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
            }}>
              Step {step}/{totalSteps}
            </span>
          </div>
          <div style={{
            height: "6px",
            backgroundColor: "#e5e7eb",
            borderRadius: "9999px",
            overflow: "hidden",
          }}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
                borderRadius: "9999px",
                width: `${progressPercent}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}>
          {/* Step 1: Store Info & Owner Name */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease-out" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}>Business Information</h2>

              {/* Store Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <Store size={18} color="#2563eb" /> Store Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your store name"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange("storeName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: errors.storeName ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                    backgroundColor: errors.storeName ? "#fef2f2" : "#f9fafb",
                    fontSize: "14px",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.storeName && (
                  <div style={{ fontSize: "12px", color: "#dc2626" }}>⚠️ {errors.storeName}</div>
                )}
              </div>

              {/* Owner Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <User size={18} color="#8b5cf6" /> Your Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange("ownerName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: errors.ownerName ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                    backgroundColor: errors.ownerName ? "#fef2f2" : "#f9fafb",
                    fontSize: "14px",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.ownerName && (
                  <div style={{ fontSize: "12px", color: "#dc2626" }}>⚠️ {errors.ownerName}</div>
                )}
              </div>

              {/* Phone Number */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <Phone size={18} color="#10b981" /> Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: errors.phoneNumber ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                    backgroundColor: errors.phoneNumber ? "#fef2f2" : "#f9fafb",
                    fontSize: "14px",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.phoneNumber && (
                  <div style={{ fontSize: "12px", color: "#dc2626" }}>⚠️ {errors.phoneNumber}</div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Password */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease-out" }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}>Secure Your Account</h2>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <Lock size={18} color="#f59e0b" /> Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      paddingRight: "44px",
                      borderRadius: "8px",
                      border: errors.password ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                      backgroundColor: errors.password ? "#fef2f2" : "#f9fafb",
                      fontSize: "14px",
                      color: "#111827",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      color: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <div style={{ fontSize: "12px", color: "#dc2626" }}>⚠️ {errors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <Lock size={18} color="#ef4444" /> Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      paddingRight: "44px",
                      borderRadius: "8px",
                      border: errors.confirmPassword ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                      backgroundColor: errors.confirmPassword ? "#fef2f2" : "#f9fafb",
                      fontSize: "14px",
                      color: "#111827",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "8px",
                      color: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div style={{ fontSize: "12px", color: "#dc2626" }}>⚠️ {errors.confirmPassword}</div>
                )}
              </div>

              <div style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                color: "#1e40af",
              }}>
                ✓ Password will be securely encrypted with bcrypt
              </div>
            </div>
          )}

          {errors.submit && (
            <div style={{
              fontSize: "14px",
              color: "#dc2626",
              backgroundColor: "#fef2f2",
              padding: "12px",
              borderRadius: "8px",
            }}>
              ⚠️ {errors.submit}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "16px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Creating..." : "Create Store"}
              </button>
            )}
          </div>

          {/* Sign In Link */}
          <div style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#4b5563",
          }}>
            Already have an account?{" "}
            <button
              type="button"
              style={{
                color: "#2563eb",
                fontWeight: "600",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                textDecoration: "none",
              }}
              onClick={() => alert("Sign in page would open here")}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{
          marginTop: "32px",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          fontSize: "12px",
          color: "#6b7280",
        }}>
          <span>🔒 Secure</span>
          <span>⚡ Quick</span>
          <span>✨ Easy</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;                