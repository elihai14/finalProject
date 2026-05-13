import { useState } from "react";
<<<<<<< HEAD
import Swal from "sweetalert2";
import classes from "./updateDetailsForm.module.css";

=======
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import classes from "./updateDetailsForm.module.css";
>>>>>>> e5c54ed (add navBar component)

export default function UpdateDetailsForm() 
{
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdate = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:5000/users/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", 
          body: JSON.stringify({
            phoneNumber: phone,
            newEmail: email,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // הרשמה בוצעה בהצלחה - מעבר ללוגין
          Swal.fire({
            title: "פרטיך עודכנו בהצלחה",
            text: "פרטיך עודכנו בהצלחה !",
            icon: "success",
            confirmButtonText: "מעולה",
            confirmButtonColor: "#3085d6",
          })
        } else {
          // כאן נתפסת הבדיקה של הבקאנד (למשל: "משתמש כבר קיים")
          setError(data.message || "שגיאה בתהליך עדכון הפרטים ");
        }
      } catch (err) {
        setError("שגיאת תקשורת עם השרת");
      } finally {
        setIsLoading(false);
      }
    };

    return (

  <div className={classes.overlay}>

<<<<<<< HEAD
        <form onSubmit={handleUpdate} className={classes.form}>
          {/* מס' טלפון */}
          <input
            type="tel"
            placeholder="מס' טלפון"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            
            className={classes.input}
          />

          {/* כתובת מייל */}
          <input
            type="email"
            placeholder="כתובת מייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
            className={classes.input}
          />

          <button type="submit" className={classes.button} disabled={isLoading}>
            עדכון הפרטים
          </button>
        </form>
      </div>
    );
}
=======
    <div className={classes.popup}>

      <h2 className={classes.title}>
        עדכון פרטים
      </h2>

      {/* הצגת שגיאה מהבקאנד */}
      {error && (
        <p className={classes.errorMessage}>
          {error}
        </p>
      )}

      <form
        onSubmit={handleUpdate}
        className={classes.form}
      >

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

        {/* כפתור */}
        <button
          type="submit"
          className={classes.button}
          disabled={isLoading}
        >

          {isLoading ? "מעדכן..." : "שמור שינויים"}

        </button>

        <p className={classes.footerText}>
          כבר יש לך חשבון?{" "}

          <Link
            to="/login"
            className={classes.linkBtn}
          >
            התחבר
          </Link>

        </p>

      </form>

    </div>

  </div>

);
}
>>>>>>> e5c54ed (add navBar component)
