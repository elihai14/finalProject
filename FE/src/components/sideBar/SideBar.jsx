import React, { useState } from "react";
import { Link } from "react-router-dom"; 
import classes from "./sideBar.module.css";
import { FaHome, FaSlidersH, FaExchangeAlt, FaUserEdit } from "react-icons/fa";
import UpdateDetailsForm from "../updateDetailsForm/UpdateDetailsForm"; 

export default function SideBar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false); // 👈 סטייט לשליטה בפופ-אפ
    
    const status = localStorage.getItem("userStatus");

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const getHomePath = () => {
        if (status === "לקוח") return '/client-dashboard';
        if (status === "ספר") return '/barber-dashboard';
        if (status === "מנהל") return '/admin-dashboard'; 
        return '/'; 
    };

    return (
        <div className={classes.sideBarContainer}>
            {/* כפתור ה-3 פסים (המבורגר) */}
            <button className={classes.hamburger} onClick={toggleMenu} aria-label="תפריט">
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

                <Link to="/manage-services" onClick={toggleMenu}>
                    <FaSlidersH className={classes.navIcon} />
                    <span>ניהול שירותים</span>
                </Link>

                <Link to="/barbers-constraints" onClick={toggleMenu}>
                    <FaExchangeAlt className={classes.navIcon} />
                    <span>ניהול אילוצים</span>
                </Link>

                {/* 📝 כפתור עדכון פרטים - משנה את showPopup ל-true וסוגר את התפריט */}
                <button 
                    className={classes.navButton} 
                    onClick={() => { 
                        setShowPopup(true); 
                        toggleMenu(); 
                    }}
                >
                    <FaUserEdit className={classes.navIcon} />
                    <span>עדכון פרטים</span>
                </button>
                
            </nav>
            
            {/* רקע כהה לסגירה בלחיצה מחוץ לתפריט צד */}
            {isOpen && <div className={classes.overlay} onClick={toggleMenu}></div>}

            {/* 👑 הקסם קורה פה: אם לחצו על הכפתור, נרנדר את הפופ-אפ של הטופס */}
            {showPopup && (
                <UpdateDetailsForm onClose={() => setShowPopup(false)} />
            )}
        </div>
    );
}