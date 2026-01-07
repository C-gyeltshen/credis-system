import React, { useState } from "react";
import { Store, Lock, User, Phone, AlertCircle, Check } from "lucide-react";

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
      // Store Name validation
      if (!formData.storeName.trim()) {
        newErrors.storeName = "👉 Please enter your store name";
      } else if (formData.storeName.trim().length < 2) {
        newErrors.storeName = "👉 Store name must be at least 2 letters";
      } else if (formData.storeName.trim().length > 50) {
        newErrors.storeName = "👉 Store name is too long (max 50 characters)";
      }

      // Phone Number validation
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "👉 Please enter your phone number";
      } else if (formData.phoneNumber.trim().length < 7) {
        newErrors.phoneNumber = "👉 Phone number is too short";
      } else if (formData.phoneNumber.trim().length > 15) {
        newErrors.phoneNumber = "👉 Phone number is too long";
      } else if (!/^[0-9\-\s()+]*$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "👉 Phone number can only contain numbers, dashes, spaces, and parentheses";
      }

      // Owner Name validation
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = "👉 Please enter your full name";
      } else if (formData.ownerName.trim().length < 2) {
        newErrors.ownerName = "👉 Name must be at least 2 letters";
      } else if (formData.ownerName.trim().length > 50) {
        newErrors.ownerName = "👉 Name is too long (max 50 characters)";
      } else if (!/^[a-zA-Z\s]*$/.test(formData.ownerName.trim())) {
        newErrors.ownerName = "👉 Name can only contain letters and spaces";
      }
    }

    if (currentStep === 2) {
      // Password PIN validation
      if (!formData.password) {
        newErrors.password = "👉 Please enter your 4-digit PIN";
      } else if (formData.password.length < 4) {
        newErrors.password = `👉 PIN must be 4 digits (you entered ${formData.password.length})`;
      } else if (formData.password.length > 4) {
        newErrors.password = "👉 PIN must be exactly 4 digits";
      } else if (!/^\d{4}$/.test(formData.password)) {
        newErrors.password = "👉 PIN can only contain numbers";
      }

      // Confirm PIN validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "👉 Please confirm your 4-digit PIN";
      } else if (formData.confirmPassword.length < 4) {
        newErrors.confirmPassword = `👉 PIN must be 4 digits (you entered ${formData.confirmPassword.length})`;
      } else if (formData.confirmPassword.length > 4) {
        newErrors.confirmPassword = "👉 PIN must be exactly 4 digits";
      } else if (!/^\d{4}$/.test(formData.confirmPassword)) {
        newErrors.confirmPassword = "👉 PIN can only contain numbers";
      }

      // PIN match validation
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "👉 The PINs don't match! Please check again";
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
        setStep(3);
        return;
      }

      console.log("Registration and login successful:", loginData.user);
      setStep(3);
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
    let finalValue = value;

    // For password and confirmPassword fields, only allow digits and limit to 4
    if (field === "password" || field === "confirmPassword") {
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
              onClick={() => window.location.href = "/customer-dashboard"}
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

      <div style={{ width: "100%", maxWidth: "448px", padding: "clamp(16px, 4%, 32px)" }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: "clamp(24px, 5%, 32px)" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "clamp(12px, 3%, 16px)",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            <h1 style={{
              fontSize: "clamp(20px, 6vw, 24px)",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
            }}>Start Your Store</h1>
            <span style={{
              fontSize: "clamp(12px, 3vw, 14px)",
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
          borderRadius: "clamp(12px, 3%, 16px)",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          padding: "clamp(20px, 5%, 32px)",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(20px, 5%, 32px)",
        }}>
          {/* Step 1: Store Info & Owner Name */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 4%, 24px)", animation: "fadeIn 0.3s ease-out" }}>
              <h2 style={{
                fontSize: "clamp(18px, 5vw, 20px)",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}>Business Information</h2>

              {/* Store Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 2%, 8px)" }}>
                <label style={{
                  fontSize: "clamp(12px, 3vw, 14px)",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 2%, 8px)",
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
                    padding: "clamp(10px, 2%, 12px) clamp(12px, 3%, 16px)",
                    borderRadius: "8px",
                    border: errors.storeName ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                    backgroundColor: errors.storeName ? "#fef2f2" : "#f9fafb",
                    fontSize: "clamp(13px, 3vw, 14px)",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.storeName && (
                  <div style={{ 
                    fontSize: "clamp(12px, 3vw, 13px)", 
                    color: "#dc2626",
                    backgroundColor: "#fef2f2",
                    padding: "clamp(6px, 2%, 8px) clamp(10px, 2%, 12px)",
                    borderRadius: "6px",
                    border: "1px solid #fecaca",
                  }}>
                    {errors.storeName}
                  </div>
                )}
              </div>

              {/* Owner Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 2%, 8px)" }}>
                <label style={{
                  fontSize: "clamp(12px, 3vw, 14px)",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 2%, 8px)",
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
                    padding: "clamp(10px, 2%, 12px) clamp(12px, 3%, 16px)",
                    borderRadius: "8px",
                    border: errors.ownerName ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                    backgroundColor: errors.ownerName ? "#fef2f2" : "#f9fafb",
                    fontSize: "clamp(13px, 3vw, 14px)",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.ownerName && (
                  <div style={{ 
                    fontSize: "clamp(12px, 3vw, 13px)", 
                    color: "#dc2626",
                    backgroundColor: "#fef2f2",
                    padding: "clamp(6px, 2%, 8px) clamp(10px, 2%, 12px)",
                    borderRadius: "6px",
                    border: "1px solid #fecaca",
                  }}>
                    {errors.ownerName}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 2%, 8px)" }}>
                <label style={{
                  fontSize: "clamp(12px, 3vw, 14px)",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 2%, 8px)",
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
                    padding: "clamp(10px, 2%, 12px) clamp(12px, 3%, 16px)",
                    borderRadius: "8px",
                    border: errors.phoneNumber ? "2px solid #fca5a5" : "2px solid #e5e7eb",
                    backgroundColor: errors.phoneNumber ? "#fef2f2" : "#f9fafb",
                    fontSize: "clamp(13px, 3vw, 14px)",
                    color: "#111827",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
                {errors.phoneNumber && (
                  <div style={{ 
                    fontSize: "clamp(12px, 3vw, 13px)", 
                    color: "#dc2626",
                    backgroundColor: "#fef2f2",
                    padding: "clamp(6px, 2%, 8px) clamp(10px, 2%, 12px)",
                    borderRadius: "6px",
                    border: "1px solid #fecaca",
                  }}>
                    {errors.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: PIN */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 4%, 24px)", animation: "fadeIn 0.3s ease-out" }}>
              <h2 style={{
                fontSize: "clamp(18px, 5vw, 20px)",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}>Set Your PIN</h2>

              {/* Password PIN Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 2%, 8px)" }}>
                <label style={{
                  fontSize: "clamp(12px, 3vw, 14px)",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 2%, 8px)",
                }}>
                  <Lock size={18} color="#f59e0b" /> Create PIN (4 Digits)
                </label>
                <div style={{
                  display: "flex",
                  gap: "clamp(8px, 3%, 16px)",
                  justifyContent: "space-between",
                }}>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={`password-${index}`}
                      type="text"
                      value={formData.password[index] || ""}
                      onChange={(e) => {
                        const newPassword = formData.password.split("");
                        newPassword[index] = e.target.value.replace(/[^0-9]/g, "");
                        const updatedPassword = newPassword.slice(0, 4).join("");
                        handleInputChange("password", updatedPassword);

                        if (e.target.value && index < 3) {
                          const nextInput = document.querySelector(
                            `input[data-pin-index="password-${index + 1}"]`
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
                            `input[data-pin-index="password-${index - 1}"]`
                          ) as HTMLInputElement;
                          prevInput?.focus();
                        }
                      }}
                      disabled={loading}
                      maxLength={1}
                      inputMode="numeric"
                      data-pin-index={`password-${index}`}
                      placeholder="0"
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
                  <div style={{ fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password PIN Field */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 2%, 8px)" }}>
                <label style={{
                  fontSize: "clamp(12px, 3vw, 14px)",
                  fontWeight: "600",
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(6px, 2%, 8px)",
                }}>
                  <Lock size={18} color="#ef4444" /> Confirm PIN (4 Digits)
                </label>
                <div style={{
                  display: "flex",
                  gap: "clamp(8px, 3%, 16px)",
                  justifyContent: "space-between",
                }}>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={`confirm-${index}`}
                      type="text"
                      value={formData.confirmPassword[index] || ""}
                      onChange={(e) => {
                        const newConfirmPassword = formData.confirmPassword.split("");
                        newConfirmPassword[index] = e.target.value.replace(/[^0-9]/g, "");
                        const updatedConfirmPassword = newConfirmPassword.slice(0, 4).join("");
                        handleInputChange("confirmPassword", updatedConfirmPassword);

                        if (e.target.value && index < 3) {
                          const nextInput = document.querySelector(
                            `input[data-pin-index="confirm-${index + 1}"]`
                          ) as HTMLInputElement;
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !formData.confirmPassword[index] &&
                          index > 0
                        ) {
                          const prevInput = document.querySelector(
                            `input[data-pin-index="confirm-${index - 1}"]`
                          ) as HTMLInputElement;
                          prevInput?.focus();
                        }
                      }}
                      disabled={loading}
                      maxLength={1}
                      inputMode="numeric"
                      data-pin-index={`confirm-${index}`}
                      placeholder="0"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        aspectRatio: "1 / 1",
                        maxWidth: "80px",
                        borderRadius: "12px",
                        border: errors.confirmPassword
                          ? "2px solid #fca5a5"
                          : "2px solid #e5e7eb",
                        backgroundColor: errors.confirmPassword ? "#fef2f2" : "#f9fafb",
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
                {errors.confirmPassword && (
                  <div style={{ fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={14} /> {errors.confirmPassword}
                  </div>
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
                ✓ PIN will be securely encrypted
              </div>
            </div>
          )}

          {errors.submit && (
            <div style={{
              fontSize: "14px",
              color: "#7c2d12",
              backgroundColor: "#fed7aa",
              padding: "16px",
              borderRadius: "8px",
              border: "2px solid #ea580c",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: "600", marginBottom: "4px" }}>Oops! Something went wrong</div>
                <div style={{ fontSize: "13px" }}>{errors.submit}</div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", gap: "clamp(8px, 2%, 12px)" }}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "clamp(10px, 2%, 12px) clamp(12px, 3%, 16px)",
                  borderRadius: "8px",
                  border: "2px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontWeight: "600",
                  fontSize: "clamp(13px, 3vw, 16px)",
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
                  padding: "clamp(10px, 2%, 12px) clamp(12px, 3%, 16px)",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "clamp(13px, 3vw, 16px)",
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
                  padding: "clamp(10px, 2%, 12px) clamp(12px, 3%, 16px)",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: "600",
                  fontSize: "clamp(13px, 3vw, 16px)",
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
            fontSize: "clamp(12px, 3vw, 14px)",
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
                fontSize: "clamp(12px, 3vw, 14px)",
              }}
              onClick={() => window.location.href = "/login"}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{
          marginTop: "clamp(24px, 5%, 32px)",
          display: "flex",
          justifyContent: "center",
          gap: "clamp(16px, 4%, 24px)",
          fontSize: "clamp(11px, 2.5vw, 12px)",
          color: "#6b7280",
          flexWrap: "wrap",
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