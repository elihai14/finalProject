import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // הוספנו את useLocation
import classes from './navBar.module.css';
import UpdateDetailsForm from "../updateDetailsForm/UpdateDetailsForm";

const Navbar = ({ user, setUser }) => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // מאפשר לנו לדעת באיזה דף אנחנו

  const handleLogout = () => {
    setUser("");
    // חשוב: תוודא שאתה מוחק את כל מה ששמרת ב-Login
    localStorage.removeItem('userStatus');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    navigate('/login');
  };
  console.log(location.pathname);
  
  // בדיקה: האם אנחנו נמצאים כרגע בדף התחברות או הרשמה?
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/';
  
  return (
    <nav className={classes.topNav}>
      {/* 
          התנאי החדש: 
          אם אין משתמש מחובר בכלל 
          או 
          שאנחנו נמצאים פיזית בדף התחברות/הרשמה
      */}
        {user == "" && isAuthPage ? (
        <div className={classes.userLinks}>
            <Link to="/register" className={classes.navButton}>הרשמה</Link>
            <Link to="/login" className={classes.navButton}>התחברות</Link>
        </div>
        ) : (
        <div className={classes.userLinks}>
            <span>שלום, {user}</span>
            <button className={classes.navButton} onClick={() => setShowPopup(true)}>עדכון פרטים</button>
            <button className={`${classes.navButton} ${classes.logoutBtn}`} onClick={handleLogout}>התנתקות</button>
        </div>
        )}
      {showPopup && <UpdateDetailsForm  onClose={() => setShowPopup(false)} />}
    </nav>
  );
};

export default Navbar;