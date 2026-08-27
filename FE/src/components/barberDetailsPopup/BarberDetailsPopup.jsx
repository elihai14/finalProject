// ייבוא פונקציית createPortal מ-React DOM להצגת רכיבים מחוץ לעץ הרגיל
import { createPortal } from "react-dom";
// ייבוא קובץ העיצוב (CSS Module)
import classes from "./barberDetailsPopup.module.css";

// קומפוננטת פופאפ להצגת הפרטים המלאים של הספר (שם, טלפון, ושירותים מוצעים)
export default function BarberDetailsPopup({
  barberName,
  barberPhone,
  barberServices,
  isLoading,
  onClose,
}) {
// סגירת החלון הקופץ בלחיצה על הרקע (מחוץ לתיבת התוכן)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

// בניית ה-JSX של החלון הקופץ
  const popup = (
    <div className={classes.overlay} onClick={handleOverlayClick}>
{/* עצירת פעפוע האירוע בלחיצה על גוף הפופאפ כדי למנוע סגירה ללא כוונה */}
      <div className={classes.popup} onClick={(e) => e.stopPropagation()}>
{/* כפתור איקס לסגירת החלון */}
        <button className={classes.close_btn} onClick={onClose} type="button">
          ✕
        </button>

        <h2>פרטי הספר</h2>

{/* הצגת מצב טעינה או נתוני הספר */}
        {isLoading ? (
          <div className={classes.loading}>טוען פרטים...</div>
        ) : (
          <>
{/* הצגת שם הספר */}
            <div className={classes.info_item}>
              <span className={classes.label}>שם מלא:</span>

              <span className={classes.value}>{barberName || "לא צוין"}</span>
            </div>

{/* הצגת טלפון הספר */}
            <div className={classes.info_item}>
              <span className={classes.label}>טלפון:</span>

              <span className={classes.value}>{barberPhone || "לא צוין"}</span>
            </div>

{/* רשימת השירותים שהספר מספק */}
            <div className={classes.services_section}>
              <span className={classes.label}>שירותים שהוא מבצע:</span>

              {barberServices?.length > 0 ? (
                <ul className={classes.services_list}>
                  {barberServices.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              ) : (
                <p className={classes.no_services}>לא נמצאו שירותים</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

// רינדור הפופאפ ישירות לתוך ה-Body בעזרת Portal
  return createPortal(popup, document.body);
}