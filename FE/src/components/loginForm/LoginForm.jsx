import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { fetchUser } from "../../../js/mainFunctionView";
import classes from "./loginForm.module.css";

function LoginForm({ setUser }) {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

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
        setStep(2);
      } else {
        setError(data.message || "מייל לא קיים במערכת");
      }
    } catch (err) {
      setError("שגיאת תקשורת עם השרת");
    } finally {
      setIsLoading(false);
    }
  };

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

      // 1. עדכון המשתמש
      if (setUser) {
        await fetchUser(setUser);
      }

      // 2. קודם כל מקפיצים את ההודעה ומחכים שהמשתמש יסגור אותה!
      if (data.hasUpcomingAppointments) {
        await Swal.fire({
          title: "✂️ תזכורת לתור קרוב!",
          html: "<b>שים לב:</b> קיימים לך תורים מתוכננים לשבוע הקרוב<br>ניתן לצפות בפרטי התור באזור האישי",
          icon: "info",
          confirmButtonText: "מעולה, תודה!",
          confirmButtonColor: "#dfb76c", // צבע הזהב של הכפתור
          color: "#e0e0e0",               // צבע הטקסט (לבן-אפרפר קריא)
          background: "#18191c",          // צבע הרקע הכהה של המודאל
          iconColor: "#d4af37",           // צבע האייקון לזהב
          direction: "rtl",
          customClass: {
            popup: "custom-swal-popup",
            confirmButton: "custom-swal-button",
          },
        });
      }

      // 3. רק אחרי העברת הדף מבוצעת!
      if (status === "מנהל") {
        navigate("/admin-dashboard");
      } else if (status === "ספר") {
        navigate("/barber-dashboard");
      } else {
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