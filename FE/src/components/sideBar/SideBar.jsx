// ייבוא הוקים מ-React, רכיב Link לניווט, קובץ העיצוב ואייקונים מ-react-icons
import React, { useState } from "react";
import { Link } from "react-router-dom";
import classes from "./sideBar.module.css";
import {
  FaHome,
  FaSlidersH,
  FaExchangeAlt,
  FaUserEdit,
  FaClock,
  FaCut,
  FaCalendarCheck,
  FaUsersCog,
} from "react-icons/fa";
import { useEffect } from "react";
import { fetchUser } from "../../../js/mainFunctionView";

// קומפוננטת תפריט הצד (Sidebar) הדינמי לפי סוג המשתמש
export default function SideBar() {
// ניהול מצב פתיחה/סגירה של התפריט ושמירת פרטי המשתמש המחובר
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({});

// טעינת פרטי המשתמש בעת טעינת הקומפוננטה
  useEffect(() => {
    fetchUser(setUser);
  }, []);

  const status = user.status;

// פונקציה לשינוי מצב פתיחה/סגירה של תפריט הצד
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

// פונקציה המחזירה את נתיב דף הבית המתאים לפי סוג המשתמש (לקוח/ספר/מנהל)
  const getHomePath = () => {
    if (status === "לקוח") return "/client-dashboard";
    if (status === "ספר") return "/barber-dashboard";
    if (status === "מנהל") return "/admin-dashboard";
    return "/";
  };

  return (
    <div className={classes.sideBarContainer}>
      {/* כפתור ה-3 פסים (המבורגר) */}
      <button
        className={classes.hamburger}
        onClick={toggleMenu}
        aria-label="תפריט"
      >
        <div className={`${classes.bar} ${isOpen ? classes.open1 : ""}`}></div>
        <div className={`${classes.bar} ${isOpen ? classes.open2 : ""}`}></div>
        <div className={`${classes.bar} ${isOpen ? classes.open3 : ""}`}></div>
      </button>

      {/* תפריט הצד שנשלף מימין */}
      <nav className={`${classes.sidebarNav} ${isOpen ? classes.active : ""}`}>
{/* קישור לדף הבית */}
        <Link to={getHomePath()} onClick={toggleMenu}>
          <FaHome className={classes.navIcon} />
          <span>דף הבית</span>
        </Link>

{/* קישורים הייחודיים לספר או מנהל */}
        {(status === "ספר" || status === "מנהל") && (
          <>
            <Link to="/manage-services" onClick={toggleMenu}>
              <FaCut className={classes.navIcon} />
              <span>ניהול שירותים</span>
            </Link>

            <Link to="/barbers-constraints" onClick={toggleMenu}>
              <FaCalendarCheck className={classes.navIcon} />
              <span>ניהול זמינות ספרים</span>
            </Link>
          </>
        )}

{/* קישורים הייחודיים למנהל בלבד */}
        {status == "מנהל" && (
          <>
            <Link to="/manage-users" onClick={toggleMenu}>
              <FaUsersCog className={classes.navIcon} />
              <span>ניהול משתמשים</span>
            </Link>

            <Link to="/manage-days-hours" onClick={toggleMenu}>
              <FaClock className={classes.navIcon} />{" "}
              <span>ניהול שעות פעילות</span>
            </Link>
          </>
        )}

{/* קישור לעדכון פרטים אישיים - זמין לכל המשתמשים */}
        <Link to="/update" onClick={toggleMenu} className={classes.navButton}>
          <FaUserEdit className={classes.navIcon} />
          <span>עדכון פרטים</span>
        </Link>
      </nav>

      {/* רקע כהה לסגירה בלחיצה מחוץ לתפריט צד */}
      {isOpen && <div className={classes.overlay} onClick={toggleMenu}></div>}
    </div>
  );
}