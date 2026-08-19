import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classes from "./navBar.module.css";
import UpdateDetailsForm from "../updateDetailsForm/UpdateDetailsForm";

const Navbar = ({ user, setUser }) => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

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
      {!isLoggedIn ? (
        <div className={classes.guestLinks}>
          <Link to="/register" className={classes.navButton}>הרשמה</Link>
          <Link to="/login" className={classes.navButton}>התחברות</Link>
        </div>
      ) : (
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
      {showPopup && <UpdateDetailsForm onClose={() => setShowPopup(false)} />}
    </nav>
  );
};

export default Navbar;