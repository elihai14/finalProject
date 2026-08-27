// ייבוא הוקים מ-React וספריית הניווט
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./navBar.module.css";
// ייבוא קומפוננטת טופס עדכון הפרטים האישיים
import UpdateDetailsForm from "../updateDetailsForm/UpdateDetailsForm";

// קומפוננטת סרגל הניווט העליון של האתר
const Navbar = ({ user, setUser }) => {
// ניהול מודאל עדכון פרטים וניווט בין דפים
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

// פונקציה לטיפול בהתנתקות המשתמש מהמערכת
  const handleLogout = async () => {
    try {
// שליחת בקשת התנתקות לשרת
      const response = await fetch("http://localhost:5000/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

// איפוס נתוני המשתמש והעברה לדף הבית במידה והתנתק בהצלחה
      if (response.ok) {
        setUser(null); // איפוס ל-null
        navigate("/");
      }
    } catch (err) {
      console.error("שגיאת התנתקות");
    }
  };

  // בדיקה פשוטה: אם user קיים ויש לו שם, הוא מחובר
  const isLoggedIn = user && user.user_name;

  return (
    <nav className={classes.topNav}>
{/* תצוגה עבור משתמש שאינו מחובר - קישורים להרשמה והתחברות */}
      {!isLoggedIn ? (
        <div className={classes.guestLinks}>
          <Link to="/register" className={classes.navButton}>הרשמה</Link>
          <Link to="/login" className={classes.navButton}>התחברות</Link>
        </div>
      ) : (
/* תצוגה עבור משתמש מחובר - הצגת השם, התפקיד וכפתור התנתקות */
        <>
          <span className={classes.userName}>
            שלום, {user.user_name} [{user.status}]
          </span>
          <div className={classes.userActions}>
            <button
              className={`${classes.navButton} ${classes.logoutBtn}`}
              onClick={handleLogout}
            >
              התנתקות
            </button>
          </div>
        </>
      )}
{/* הצגת פופ-אפ עדכון פרטים במידה וטריגר showPopup פתוח */}
      {showPopup && <UpdateDetailsForm onClose={() => setShowPopup(false)} />}
    </nav>
  );
};

export default Navbar;