// ייבוא הוקים של React לניהול State
import { useState } from "react";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./appCard.module.css";
// ייבוא קומפוננטת חלון קופץ להצגת פרטי הספר
import BarberDetailsPopup from "../barberDetailsPopup/BarberDetailsPopup";
// ייבוא פונקציית עזר לשליפת פרטי הספר המלאים
import { fetchBarberDetails } from "../../../js/mainFunctionView";

// קומפוננטה להצגת כרטיס תור בודד
export default function AppCard({ app, onCancel }) {

// ניהול מצב להצגת החלון הקופץ ואחסון פרטי הספר
  const [showPopUp, setShowPopUp] = useState(false);
  const [barberDetails, setBarberDetails] = useState(null);

// פונקציה לשליפת פרטי הספר והצגת החלון הקופץ בעת לחיצה על שם הספר
  const handleShowBarber = async () => {
    const details = await fetchBarberDetails(app.barberMailAddress);

    setBarberDetails(details);
    setShowPopUp(true);
  };

// חישוב התאריך והשעה הנוכחיים לבדיקת תוקף התור
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentTimeStr = `${String(today.getHours()).padStart(2, "0")}:${String(
    today.getMinutes()
  ).padStart(2, "0")}`;

// בדיקה האם התור מיועד לזמן עתידי (כדי להחליט אם להציג כפתור ביטול)
  const isFutureAppointment =
    app.date > todayStr || (app.date === todayStr && app.time > currentTimeStr);

  return (
    <div className={classes.appointment_card}>
{/* אזור הצגת תאריך ושעת התור */}
      <div className={classes.time_section}>
        <span className={classes.date}>{app.date}</span>
        <span className={classes.time}>{app.time}</span>
      </div>

{/* אזור הצגת שם הספר והלקוח */}
      <div className={classes.info_section}>
{/* לחיצה על שם הספר פותחת את פופאפ הפרטים */}
        <span className={classes.barberName} onClick={handleShowBarber}>
          ✂️ {app.barberName}
        </span>

        <span className={classes.clientName}>👤 לקוח: {app.customerName}</span>
      </div>

{/* אזור פרטי השירות, המחיר וכפתור הביטול */}
      <div className={classes.details_section}>
        <h3 className={classes.service_name}>{app.serviceName}</h3>

        {app.price && <span className={classes.price}>{app.price}</span>}

{/* הצגת כפתור ביטול רק עבור תורים עתידיים במידה ונשלחה פונקציית ביטול */}
        {isFutureAppointment && onCancel && (
          <button className={classes.cancel_btn} onClick={onCancel}>
            ביטול
          </button>
        )}
      </div>

{/* הצגת החלון הקופץ עם פרטי הספר במידה ומצב הצפייה פעיל */}
      {showPopUp && (
        <BarberDetailsPopup
          barberName={barberDetails?.barberName}
          barberPhone={barberDetails?.phone}
          barberServices={barberDetails?.services}
          onClose={() => setShowPopUp(false)}
        />
      )}
    </div>
  );
}