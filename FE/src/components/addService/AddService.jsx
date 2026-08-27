// ייבוא הוקים של React לניהול State ומעגל חיים
import { useEffect, useState } from "react";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./addService.module.css";
// ייבוא ספריית התראות מעוצבות
import Swal from 'sweetalert2';
// ייבוא פונקציית עזר לשליפת נתוני המשתמש המחובר
import { fetchUser } from "../../../js/mainFunctionView";

// קומפוננטת טופס הוספת שירות חדש לתפריט של הספר
export default function AddService({ refresh , setRefresh}) {
// ניהול משתני State עבור פרטי המשתמש, רשימת השירותים הכללית ונתוני השירות החדש
  const [user , setUser] = useState({});
  const [globalServices, setGlobalServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    price: "",
    duration: "30",
  });

// ניהול מנגנון מניעת לחיצות כפולות בזמן שליחה
  const [isLoading, setIsLoading] = useState(false);

// טעינת נתוני המשתמש ורשימת השירותים הגלובלית בעת טעינת הרכיב או בעת רענון
  useEffect(() => {

    fetchUser(setUser);
    fetch("http://localhost:5000/services/global")
      .then((res) => res.json())
      .then((data) => {
        setGlobalServices(data);

// הגדרת ערך ברירת מחדל לשם השירות מתוך השירות הראשון ברשימה
        if (data.length > 0) {
          setNewService((prev) => ({
            ...prev,
            serviceName: data[0].service_name,
          }));
        }
      });
  }, [refresh]);

  
// פונקציה לטיפול בשליחת הטופס והוספת השירות
  const handleAddService = async (e) => {
    e.preventDefault();

// בדיקת תקינות שדות חובה ומניעת קריאה כפולה
    if (!newService.serviceName || !newService.price) return;
    if(isLoading) return;
    setIsLoading(true);

    try {
// שליחת בקשת POST להוספת השירות למאגר הנתונים של הספר
      const res = await fetch(
        "http://localhost:5000/services/barber/add-service",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            barberMail: user.mail_address,
            serviceName: newService.serviceName,
            price: newService.price,
            duration: newService.duration,
          }),
        }
      );

      const data = await res.json();

// הצגת התראת הצלחה ואיפוס השדות במידה וההוספה הצליחה
      if (res.ok) {
                    Swal.fire({
                    toast: true,
                    position: 'top-end',          // יקפוץ בפינה הימנית למעלה
                    icon: 'success',              // אייקון וי ירוק
                    title: data.message || 'השירות הוסף בהצלחה!',
                    showConfirmButton: false,     // בלי כפתור אישור מעציק
                    timer: 3000,                  // ייעלם אוטומטית תוך 3 שניות
                    timerProgressBar: true,       // פס התקדמות קטן למטה
                    background: '#1a1a1a',        // רקע כהה שמתאים למספרה
                    color: '#fff'                 // טקסט לבן
                  });

// טריגר לרענון הרשימות בקומפוננטות האחרות
        setRefresh(prev => !prev);

// איפוס שדות המחיר והמשך
        setNewService((prev) => ({
          ...prev,
          price: "",
          duration: "30",
        }));
        
      } else {
// הצגת התראת אזהרה במידה והשירות כבר קיים
        Swal.fire({
                    title: 'אופס...',
                    text: 'השירות כבר קיים בתפריט שלך!',
                    icon: 'warning',
                    confirmButtonText: 'הבנתי',
                    background: '#1a1a1a', // רקע כהה שמתאים למספרה
                    color: '#fff',         // טקסט לבן
                    confirmButtonColor: '#bfa15f', // כפתור בצבע זהב/חום יוקרתי כמו בעיצוב
                    customClass: {
                      popup: 'my-swal-popup'
                    }
                  });
      }
    } catch (err) {
      console.error(err);
    }
    finally{
// סיום מצב הטעינה
      setIsLoading(false);
    };
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>הוספת שירות</h3>

{/* טופס הוספת השירות */}
      <form onSubmit={handleAddService} className={classes.form}>
{/* תפריט נגלל לבחירת שם שירות מתוך הרשימה הגלובלית */}
        <select
          className={classes.select}
          value={newService.serviceName}
          onChange={(e) =>
            setNewService({ ...newService, serviceName: e.target.value })
          }
        >
          {globalServices.map((s, i) => (
            <option key={i} value={s.service_name}>
              {s.service_name}
            </option>
          ))}
        </select>

{/* שדה להזנת מחיר השירות */}
        <input
          className={classes.input}
          type="number"
          placeholder="מחיר"
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: e.target.value })
          }
        />

{/* תפריט נגלל לבחירת משך זמן השירות בדקות */}
        <select
          className={classes.select}
          value={newService.duration}
          onChange={(e) =>
            setNewService({ ...newService, duration: e.target.value })
          }
        >
          <option value="15">15 דקות</option>
          <option value="30">30 דקות</option>
          <option value="45">45 דקות</option>
          <option value="60">שעה</option>
          <option value="90">שעה וחצי</option>
        </select>

{/* כפתור שליחה עם שינוי טקסט וניטרול מבוסס מצב טעינה */}
        <button type="submit" className={classes.button} disabled={isLoading} > {isLoading ? "מוסיף..." : "הוסף +"} 
        </button>
      </form>
    </div>
  );
}