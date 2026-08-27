// ייבוא הוק ה-useState מ-React, קובץ ה-CSS והפונקציה לעדכון סטטוס המשתמש
import { useState } from "react";
import classes from "./userCard.module.css";
import { handleUpdateStatus } from "../../../js/mainFunctionView";

// קומפוננטת כרטיס משתמש להצגה ועדכון הרשאות/סטטוס משתמש
export default function userCard({ user , refresh , setRefresh }) {
// ניהול הסטטוס שנבחר בתיבת הרישום הנגללת (לקוח / ספר / מנהל)
  const [selectedStatus, setSelectedStatus] = useState(user.status);
  return (
    
    <div className={classes.user_card}>
{/* חלק הצגת פרטי המשתמש ובחירת הסטטוס */}
      <div className={classes.time_section}>
        <span className={classes.name}>{user.user_name}</span>
        <span className={classes.mail}>{user.mail_address}</span>
        <span className={classes.mail}>{user.mail}</span>
{/* תפריט נגלל לבחירת תפקיד/סטטוס חדש */}
        <select
          className={classes.status_select}
          onChange={(e) => setSelectedStatus(e.target.value)}
          value={selectedStatus}
        >
          <option value="לקוח">לקוח</option>
          <option value="ספר">ספר</option>
          <option value="מנהל">מנהל</option>
        </select>
      </div>

{/* חלק כפתורי הפעולה - עדכון סטטוס */}
      <div className={classes.details_section}>
        {
// כפתור לשליחת הבקשה לעדכון הסטטוס בשרת ורענון הנתונים
          <button
            className={classes.update_status_btn}
            onClick={() =>
              handleUpdateStatus(user.mail_address, user.status, selectedStatus, refresh , setRefresh )
            }
          >
            עדכן סטטוס
          </button>
        }
      </div>
    </div>
  );
}