import { useState } from "react";
import { useNavigate ,Link } from "react-router-dom";
import classes from "./registerForm.module.css";
import Swal from 'sweetalert2';
function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
   
    try {
      const response = await fetch("http://localhost:5000/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName: fullName,
          phoneNumber: phone,
          mailAddress: email 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // הרשמה בוצעה בהצלחה - מעבר ללוגין
        Swal.fire({
                    title: 'נרשמת בהצלחה!',
                    text: 'כעת תוכל להתחבר למערכת',
                    icon: 'success',
                    confirmButtonText: 'מעולה',
                    confirmButtonColor: '#3085d6'
        }).then(() => {
                        navigate("/"); // יעבור דף רק אחרי שהמשתמש ילחץ על אישור
});
      } else {
        // כאן נתפסת הבדיקה של הבקאנד (למשל: "משתמש כבר קיים")
        setError(data.message || "שגיאה בתהליך ההרשמה");
      }
    } catch (err) {
      setError("שגיאת תקשורת עם השרת");
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className={classes.loginContainer}>
      <h2>הרשמה</h2>

      {/* הצגת שגיאה מהבקאנד (כמו "משתמש רשום") */}
      {error && <p className={classes.errorMessage}>{error}</p>}

      <form onSubmit={handleRegister} className={classes.form}>
        
        {/* שם מלא */}
        <input
          type="text"
          placeholder="שם מלא"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className={classes.input}
        />

        {/* מס' טלפון */}
        <input
          type="tel"
          placeholder="מס' טלפון"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={classes.input}
        />

        {/* כתובת מייל */}
        <input
          type="email"
          placeholder="כתובת מייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={classes.input}
        />

        {/* כפתור הרשמה */}
        <button type="submit" className={classes.button} disabled={isLoading}>
          {isLoading ? "נרשם..." : "הרשמה"}
        </button>

        <p className={classes.footerText}>
          כבר יש לך חשבון? <Link to="/login" className={classes.linkBtn}>התחבר</Link>
        </p>
      </form>
    </div>
  ); 

}

export default RegisterForm;