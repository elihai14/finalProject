// ייבוא הוקים מ-React
import { useEffect, useState } from "react";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./globalServiceList.module.css";
// ייבוא ספרית SweetAlert2 להצגת חלונות קופצים מעוצבים
import Swal from "sweetalert2";

// קומפוננטת ניהול והצגת רשימת השירותים הכללית במערכת
export default function GlobalServicesList({ refresh , setRefresh}) {
// ניהול משתנה State לרשימת השירותים הכלליים
  const [services, setServices] = useState([]);

  // פונקציה להבאת כל השירותים מהמערכת
  const fetchGlobalServices = async () => {
    try {
// שליפת רשימת השירותים הכללית מהשרת
      const res = await fetch("http://localhost:5000/services/global");
      const data = await res.json();
      if (res.ok) setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

// טעינת רשימת השירותים בעת טעינת הקומפוננטה ובכל שינוי של refresh
  useEffect(() => {
    fetchGlobalServices();
  }, [refresh]);

  // פונקציית מחיקה מהרשימה הכללית
  const handleDelete = async (serviceName) => {
// הצגת דיאלוג אישור מחיקה לפני ביצוע הפעולה
    const result = await Swal.fire({
      title: "למחוק מהמערכת?",
      text: `האם אתה בטוח שברצונך למחוק את "${serviceName}" מרשימת השירותים הכללית?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "כן, מחק לצמיתות",
      cancelButtonText: "ביטול",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#555",
    });

// ביטול הפעולה אם המשתמש לחץ על ביטול
    if (!result.isConfirmed) return;

    try {
// שליחת בקשה לשרת למחיקת השירות הכללי
      const res = await fetch("http://localhost:5000/services/admin/remove-service", {
        method: "PUT", // בדרך כלל מחיקה מהמערכת תהיה DELETE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName }),
        credentials:"include"
      });

// במידה והמחיקה הצליחה - הצגת הודעת הצלחה ורענון הנתונים
      if (res.ok) {
        Swal.fire({ icon: "success", title: "נמחק בהצלחה", background: "#1a1a1a", color: "#fff", timer: 2000, showConfirmButton: false });
        fetchGlobalServices();
        setRefresh(prev => !prev);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
// הצגת הודעת שגיאה במקרה של כשל במחיקה
      Swal.fire({ icon: "error", title: "שגיאה", text: "לא ניתן היה למחוק את השירות", background: "#1a1a1a", color: "#fff" });
    }
  };

  return (
    <div className={classes.container}>
{/* כותרת הקומפוננטה */}
      <h3 className={classes.title}>רשימת שירותים כללית</h3>

{/* גריד להצגת כרטיסי השירותים */}
      <div className={classes.grid}>
        {services.length === 0 ? (
/* הודעה במקרה שאין שירותים במערכת */
          <p className={classes.empty}>לא נמצאו שירותים במערכת</p>
        ) : (
/* מיפוי והצגה של כל שירות ברשימה */
          services.map((s) => (
            <div key={s.service_name} className={classes.card}>
{/* שם השירות */}
              <div className={classes.info}>
                <h4>{s.service_name}</h4>
              </div>

{/* כפתור למחיקת השירות */}
              <div className={classes.actions}>
                <button
                  className={classes.deleteBtn}
                  onClick={() => handleDelete(s.service_name)}
                >
                  מחק
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}