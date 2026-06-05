import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import classes from "./navBar.module.css";
import UpdateDetailsForm from "../updateDetailsForm/UpdateDetailsForm";

const Navbar = ({ user, setUser}) => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5000/users/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUser({});
        navigate("/");
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error("שגיאת שרת פנימית ");
    }
  };

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/";

  return (
    <nav className={classes.topNav}>
      {!user && isAuthPage ? (
        // במצב אורח: הכפתורים יוצמדו לשמאל באופן טבעי
        <div className={classes.guestLinks}>
          <Link to="/register" className={classes.navButton}>
            הרשמה
          </Link>
          <Link to="/login" className={classes.navButton}>
            התחברות
          </Link>
        </div>
      ) : (
        // במצב מחובר: האלמנטים יתפצלו לקצוות בזכות ה-space-between של השרת
        <>
          <span className={classes.userName}>שלום, {user.user_name} [{user.status}]</span>
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
