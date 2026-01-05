import React, { useState } from "react";
import {
  ChevronRight,
  Check,
  Store,
  User,
  Mail,
  Lock,
  AlertCircle,
} from "lucide-react";

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0f5ff 0%, #f0e8ff 50%, #ffe8f5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    paddingTop: "32px",
    paddingBottom: "32px",
  },
  wrapper: {
    width: "100%",
    maxWidth: "448px",
  },
  progressContainer: {
    marginBottom: "32px",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  progressTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  progressStep: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
  },
  progressBar: {
    height: "6px",
    backgroundColor: "#e5e7eb",
    borderRadius: "9999px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)",
    borderRadius: "9999px",
    transition: "width 0.3s ease",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  stepContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    animation: "fadeIn 0.3s ease-out",
  },
  stepHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconBoxBlue: {
    backgroundColor: "#dbeafe",
  },
  iconBoxPurple: {
    backgroundColor: "#f3e8ff",
  },
  iconBoxPink: {
    backgroundColor: "#fce7f3",
  },
  iconBoxGreen: {
    backgroundColor: "#dcfce7",
  },
  iconBlue: {
    color: "#2563eb",
  },
  iconPurple: {
    color: "#9333ea",
  },
  iconPink: {
    color: "#ec4899",
  },
  iconGreen: {
    color: "#16a34a",
  },
  stepHeaderText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  stepTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  stepSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
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
  errorMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#dc2626",
  },
  securityInfo: {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    color: "#1e40af",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
  },
  buttonBack: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "8px",
    border: "2px solid #e5e7eb",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  buttonNext: {
    flex: 1,
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
  buttonSubmit: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  buttonDisabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
  footerLink: {
    textAlign: "center",
    fontSize: "14px",
    color: "#4b5563",
  },
  signInLink: {
    color: "#2563eb",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "none",
  },
  trustBadges: {
    marginTop: "32px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "24px",
    fontSize: "12px",
    color: "#6b7280",
  },
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    textAlign: "center",
  },
  successIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4ade80 0%, #10b981 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "bounce 2s ease-in-out infinite",
  },
  successTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: 0,
  },
  successText: {
    fontSize: "16px",
    color: "#6b7280",
    margin: 0,
  },
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL;

type ErrorType = {
  storeName?: string;
  address?: string;
  phoneNumber?: string;
  ownerName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  submit?: string;
  [key: string]: string | undefined;
};

type FormDataType = {
  storeName: string;
  address: string;
  phoneNumber: string;
  ownerName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterScreen = () => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorType>({});
  const [formData, setFormData] = useState<FormDataType>({
    storeName: "",
    address: "",
    phoneNumber: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  const validateStep = (currentStep: number): boolean => {
    const newErrors: ErrorType = {};

    if (currentStep === 1) {
      if (!formData.storeName.trim()) {
        newErrors.storeName = "Store name is required";
      } else if (formData.storeName.trim().length < 2) {
        newErrors.storeName = "Store name must be at least 2 characters";
      }
      if (!formData.address.trim()) {
        newErrors.address = "Address is required";
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!/^\+?[0-9\-\s]{7,15}$/.test(formData.phoneNumber.trim())) {
        newErrors.phoneNumber = "Enter a valid phone number";
      }
    }

    if (currentStep === 2) {
      if (!formData.ownerName.trim()) {
        newErrors.ownerName = "Your name is required";
      }
    }

    if (currentStep === 3) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (currentStep === 4) {
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

  const handleNext = (): void => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = (): void => {
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
          address: formData.address,
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
        email: formData.email,
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
          credentials: "include", // Important: Include cookies for HttpOnly
          body: JSON.stringify(registrationBody),
        }
      );
      console.log("response", registrationResponse)

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
      // This step sets HttpOnly cookies automatically
      // console.log("api url", API_BASE_URL)

      const loginResponse = await fetch(`${API_BASE_URL}/store-owners/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        // Registration succeeded but login failed - show success anyway
        setStep(5);
        return;
      }

      // Success - cookies are now set by the browser automatically
      // Store owner data is available in loginData.user
      console.log("Registration and login successful:", loginData.user);

      // Move to success screen
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

  const handleInputChange = (
    field: keyof FormDataType,
    value: string
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Success Screen
  if (step === 5) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={{ ...styles.card } as React.CSSProperties}>
            <div style={styles.successContainer as React.CSSProperties}>
              <div style={styles.successIcon}>
                <Check size={32} color="#ffffff" />
              </div>

              <div>
                <h2 style={styles.successTitle}>Welcome to Your Store! 🎉</h2>
                <p style={styles.successText}>
                  Your account is ready to go. Let's get you started with
                  managing credit. You're now logged in securely.
                </p>
              </div>

              <button
                onClick={() => {
                  // After successful registration/login, redirect to dashboard
                  // Cookies are automatically sent with all future requests
                window.location.href = "/customer-dashboard";
                }}
                style={{
                  ...styles.buttonSubmit,
                  width: "100%",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 10px 15px -3px rgba(22, 163, 74, 0.3)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                }}
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <div style={styles.trustBadges}>
            <span>🔒 Secure</span>
            <span>⚡ Quick</span>
            <span>✨ Easy</span>
          </div>
        </div>
      </div>
    );
  }

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
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        input:focus {
          outline: none;
          border-color: #2563eb;
          background-color: #fff;
        }
      `}</style>

      <div style={styles.wrapper}>
        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressHeader}>
            <h1 style={styles.progressTitle}>Start Your Store</h1>
            <span style={styles.progressStep}>
              Step {step}/{totalSteps}
            </span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progressPercent}%`,
              }}
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div style={styles.card as React.CSSProperties}>
          {/* Step 1: Store Name, Address, Phone Number */}
          {step === 1 && (
            <div style={styles.stepContent as React.CSSProperties}>
              <div style={styles.stepHeader}>
                <div style={{ ...styles.iconBox, ...styles.iconBoxBlue }}>
                  <Store size={24} style={styles.iconBlue} />
                </div>
                <div style={styles.stepHeaderText as React.CSSProperties}>
                  <h2 style={styles.stepTitle}>What's your store called?</h2>
                </div>
              </div>

              <div style={styles.inputContainer as React.CSSProperties}>
                <input
                  type="text"
                  placeholder="e.g. Sweet Treats Bakery"
                  value={formData.storeName}
                  onChange={(e) =>
                    handleInputChange("storeName", e.target.value)
                  }
                  style={
                    {
                      ...styles.input,
                      ...(errors.storeName ? styles.inputError : {}),
                    } as React.CSSProperties
                  }
                />
                {errors.storeName && (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{errors.storeName}</span>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Store address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  style={
                    {
                      ...styles.input,
                      ...(errors.address ? styles.inputError : {}),
                    } as React.CSSProperties
                  }
                />
                {errors.address && (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{errors.address}</span>
                  </div>
                )}

                <input
                  type="tel"
                  placeholder="Phone number"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  style={
                    {
                      ...styles.input,
                      ...(errors.phoneNumber ? styles.inputError : {}),
                    } as React.CSSProperties
                  }
                />
                {errors.phoneNumber && (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{errors.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Owner Name */}
          {step === 2 && (
            <div style={styles.stepContent as React.CSSProperties}>
              <div style={styles.stepHeader}>
                <div style={{ ...styles.iconBox, ...styles.iconBoxPurple }}>
                  <User size={24} style={styles.iconPurple} />
                </div>
                <div style={styles.stepHeaderText as React.CSSProperties}>
                  <h2 style={styles.stepTitle}>Who's the owner?</h2>
                  <p style={styles.stepSubtitle}>We'd love to know your name</p>
                </div>
              </div>

              <div style={styles.inputContainer as React.CSSProperties}>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={formData.ownerName}
                  onChange={(e) =>
                    handleInputChange("ownerName", e.target.value)
                  }
                  style={
                    {
                      ...styles.input,
                      ...(errors.ownerName ? styles.inputError : {}),
                    } as React.CSSProperties
                  }
                />
                {errors.ownerName && (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{errors.ownerName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Email */}
          {step === 3 && (
            <div style={styles.stepContent as React.CSSProperties}>
              <div style={styles.stepHeader}>
                <div style={{ ...styles.iconBox, ...styles.iconBoxPink }}>
                  <Mail size={24} style={styles.iconPink} />
                </div>
                <div style={styles.stepHeaderText as React.CSSProperties}>
                  <h2 style={styles.stepTitle}>Your email address</h2>
                  <p style={styles.stepSubtitle}>
                    We'll use this to sign you in
                  </p>
                </div>
              </div>

              <div style={styles.inputContainer as React.CSSProperties}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  style={
                    {
                      ...styles.input,
                      ...(errors.email ? styles.inputError : {}),
                    } as React.CSSProperties
                  }
                />
                {errors.email && (
                  <div style={styles.errorMessage}>
                    <AlertCircle size={16} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Password */}
          {step === 4 && (
            <div style={styles.stepContent as React.CSSProperties}>
              <div style={styles.stepHeader}>
                <div style={{ ...styles.iconBox, ...styles.iconBoxGreen }}>
                  <Lock size={24} style={styles.iconGreen} />
                </div>
                <div style={styles.stepHeaderText as React.CSSProperties}>
                  <h2 style={styles.stepTitle}>Secure your account</h2>
                  <p style={styles.stepSubtitle}>Create a strong password</p>
                </div>
              </div>

              <div style={styles.inputContainer as React.CSSProperties}>
                <div
                  style={
                    {
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    } as React.CSSProperties
                  }
                >
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    style={
                      {
                        ...styles.input,
                        ...(errors.password ? styles.inputError : {}),
                      } as React.CSSProperties
                    }
                  />
                  {errors.password && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={16} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>

                <div
                  style={
                    {
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    } as React.CSSProperties
                  }
                >
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    style={
                      {
                        ...styles.input,
                        ...(errors.confirmPassword ? styles.inputError : {}),
                      } as React.CSSProperties
                    }
                  />
                  {errors.confirmPassword && (
                    <div style={styles.errorMessage}>
                      <AlertCircle size={16} />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.securityInfo}>
                ✓ Password will be securely encrypted with bcrypt
              </div>
            </div>
          )}

          {errors.submit && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                color: "#dc2626",
                backgroundColor: "#fef2f2",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              <AlertCircle size={20} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={styles.buttonGroup as React.CSSProperties}>
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={loading}
                style={{
                  ...styles.buttonBack,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!loading)
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "#f3f4f6";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                    "#ffffff";
                }}
              >
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={loading}
                style={{
                  ...styles.buttonNext,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 10px 15px -3px rgba(37, 99, 235, 0.3)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  ...styles.buttonSubmit,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  if (!loading)
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      "0 10px 15px -3px rgba(22, 163, 74, 0.3)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "none";
                }}
              >
                {loading ? "Creating..." : "Create Store"}
              </button>
            )}
          </div>

          {/* Sign In Link */}
          <div style={styles.footerLink as React.CSSProperties}>
            Already have an account?{" "}
            <button
              style={{
                ...styles.signInLink,
                background: "none",
                border: "none",
                padding: 0,
              }}
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div style={styles.trustBadges}>
          <span>🔒 Secure</span>
          <span>⚡ Quick</span>
          <span>✨ Easy</span>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
