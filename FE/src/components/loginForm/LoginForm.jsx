import { useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./loginForm.module.css";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // שלב 1: קריאה לשרת לבדיקת מייל ושליחת קוד
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailAddress: email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2); // המייל נמצא והקוד נשלח
      } else {
        setError(data.message || "מייל לא קיים במערכת");
      }
    } catch (err) {
      setError("שגיאת תקשורת עם השרת");
    } finally {
      setIsLoading(false);
    }
  };

  // שלב 2: אימות הקוד מול השרת
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mailAddress: email,
          code: verificationCode,
        }),
        credentials: "include",
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (response.ok) {
        const status = data.status?.trim();

        console.log("התחברות הצליחה! סטטוס:", status);

        // שמירה ב-localStorage
        localStorage.setItem("userStatus", status);
        localStorage.setItem("userEmail", email);

        // ניווט לפי סטטוס
        if (status === "מנהל") {
          navigate("/admin-dashboard");
        } else if (status === "לקוח") {
          navigate("/client-dashboard");
        } else {
          // fallback אם השרת מחזיר משהו לא צפוי
          navigate("/client-dashboard");
        }
      } else {
        setError(data.message || "קוד אימות לא נכון");
      }
    } catch (err) {
      setError("שגיאה בתהליך האימות");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className={classes.loginContainer}>
      <h2>התחברות</h2>

      {error && <p className={classes.errorMessage}>{error}</p>}

      {step === 1 && (
        <form onSubmit={handleSendEmail} className={classes.form}>
          <input
            type="email"
            placeholder="הכנס כתובת מייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={classes.input}
          />
          <button type="submit" className={classes.button} disabled={isLoading}>
            {isLoading ? "בודק..." : "שלח קוד אימות"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className={classes.form}>
          <p>
            הקוד נשלח ל-<strong>{email}</strong>
          </p>
          <input
            type="text"
            placeholder="הכנס קוד שקיבלת"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            className={classes.input}
          />
          <button type="submit" className={classes.button} disabled={isLoading}>
            {isLoading ? "מאמת..." : "התחבר עכשיו"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError("");
            }}
            className={classes.linkBtn}
          >
            שינוי כתובת מייל
          </button>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
