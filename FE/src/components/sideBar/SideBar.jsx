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

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchUser(setUser);
  }, []);

  const status = user.status;

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
        <Link to={getHomePath()} onClick={toggleMenu}>
          <FaHome className={classes.navIcon} />
          <span>דף הבית</span>
        </Link>

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
