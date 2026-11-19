import { useState } from "react";
import classes from "./updateDetailsForm.module.css";
import { handleUpdate } from "../../../js/mainFunctionView";

// קומפוננטת טופס עדכון פרטים אישיים (שם וטלפון)
export default function UpdateDetailsForm() {
  // ניהול המצבים (States) של שדות הטופס, טעינה ושגיאות
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // בדיקת תקינות שם מלא בעברית (שם פרטי ושם משפחה עם רווח ביניהם)
  const isValidFullName = (fullName) => {
    return /^[א-ת]{2,}\s+[א-ת]{2,}$/.test(fullName);
  };

  // פונקציה לטיפול בשליחת הטופס
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // איפוס שגיאות קודמות

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    // בדיקה שהמשתמש הזין לפחות שדה אחד לעדכון
    if (!trimmedName && !trimmedPhone) {
      setError("יש להזין שם מלא או מספר טלפון לעדכון.");
      return;
    }

    // ולידציה לשם מלא (רק אם הוזן ערך בשדה השם)
    if (trimmedName && !isValidFullName(trimmedName)) {
      setError("יש להזין שם פרטי ושם משפחה, עם רווח ביניהם ובעברית בלבד!");
      return;
    }

    // ולידציה למספר הטלפון (רק אם הוזן ערך בשדה הטלפון)
    if (trimmedPhone && !/^05\d{8}$/.test(trimmedPhone)) {
      setError("מס' טלפון לא תקין, עליו להתחיל ב-05 ולהכיל 10 ספרות.");
      return;
    }

    // קריאה לפונקציה המעדכנת את הפרטים בשרת
    await handleUpdate(e, setIsLoading, setError, trimmedPhone, trimmedName);

    // איפוס השדות לאחר השליחה
    setName("");
    setPhone("");
  };

  // רינדור הטופס
  return (
    <div className={classes.pageContainer}>
      <div className={classes.formWrapper}>
        <h2 className={classes.title}>עדכון פרטים</h2>

        {/* הצגת הודעת שגיאה במידה וקיימת */}
        {error && <p className={classes.errorMessage}>{error}</p>}

        <form onSubmit={handleSubmit} className={classes.form}>
          {/* שדה הזנת טלפון */}
          <input
            type="tel"
            placeholder="מס' טלפון"
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value)}
            className={classes.input}
          />

          {/* שדה הזנת שם */}
          <input
            type="text"
            placeholder="שם מלא"
            value={name}
            minLength={2}
            onChange={(e) => setName(e.target.value)}
            className={classes.input}
          />

          {/* כפתור שמירת שינויים */}
          <button type="submit" className={classes.button} disabled={isLoading}>
            {isLoading ? "מעדכן..." : "שמור שינויים"}
          </button>
        </form>
      </div>
    </div>
  );
}
