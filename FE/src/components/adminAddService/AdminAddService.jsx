// ייבוא הוקים של React לניהול State ומעגל חיים
import { useEffect, useState } from "react";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./adminAddService.module.css";
// ייבוא ספריית התראות מעוצבות
import Swal from 'sweetalert2';
// ייבוא פונקציית עזר לשליפת נתוני המשתמש המחובר
import { fetchUser } from "../../../js/mainFunctionView";
import { use } from "react";

// קומפוננטה להוספת שירות חדש ברמת מנהל מערכת לרשימה הגלובלית
export default function AdminAddService({ setRefresh }) {
// ניהול משתני State עבור נתוני המשתמש, שדה הוספת השירות ומצב הטעינה
  const [user , setUser] = useState({});
  const [newService, setNewService] = useState({ serviceName: "" });
  const [isLoading, setIsLoading] = useState(false);

// טעינת נתוני המשתמש המחובר בעת העלאת הקומפוננטה
  useEffect(() => {
    fetchUser(setUser);
  }, []);

// פונקציה לטיפול בשליחת טופס הוספת שירות גלובלי
  const handleAddService = async (e) => {
    e.preventDefault();
// בדיקת תקינות הקלט ומניעת קריאה כפולה בזמן טעינה
    if (!newService.serviceName || isLoading) return;
    setIsLoading(true);

    try {
// שליחת בקשת POST להוספת שירות ברמת אדמין
      const res = await fetch("http://localhost:5000/services/admin/add-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          barberMail: user.mail_address,
          serviceName: newService.serviceName,
        }),
      });

      const data = await res.json();
      
// הגדרת תבנית התראת קופצת (Toast) קבועה
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff'
      });

// הצגת התראת הצלחה, איפוס הקלט ורענון הנתונים במידה וההוספה הצליחה
      if (res.ok) {
        Toast.fire({
          icon: 'success',
          title: data.message || 'השירות הוסף בהצלחה!',
          iconColor: '#d4af37'
        });
        setNewService({ serviceName: "" });
        setRefresh(prev => !prev);
      } else {
// הצגת התראת אזהרה במידה והשירות כבר קיים במערכת
        Toast.fire({
          icon: 'warning',
          title: data.message || 'השירות כבר קיים בתפריט שלך!',
          iconColor: '#bfa15f'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
// סיום מצב הטעינה
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>הוספת שירות למערכת</h3>
    
{/* טופס הוספת שירות גלובלי */}
      <form onSubmit={handleAddService} className={classes.form}>
{/* שדה טקסט להזנת שם השירות החדש */}
        <input
          type="text"
          className={classes.select}
          placeholder="הכנס שם שירות..."
          value={newService.serviceName}
          onChange={(e) => setNewService({ serviceName: e.target.value })}
        />

{/* כפתור שליחה עם ניטרול מבוסס מצב טעינה */}
        <button type="submit" className={classes.button} disabled={isLoading}>
          {isLoading ? "מוסיף..." : "הוסף +"}
        </button>
      </form>
    </div>
  );
}