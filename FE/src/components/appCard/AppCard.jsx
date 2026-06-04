import classes from "./appCard.module.css";

// export default function AppCard({ app, onCancel }) {
//   return (
//     <div className={classes.appointment_card}>
//       {/* צד ימין: זמנים, ספר ולקוח */}
//       <div className={classes.time_section}>
//         <span className={classes.date}>{app.date}</span>
//         <span className={classes.time}>{app.time}</span>
//         {app.barberName && <span className={classes.barberName}>{app.barberName}</span>}
//         {app.customerName && <span className={classes.clientName}>לקוח: {app.customerName}</span>}
//       </div>

//       {/* צד שמאל: שם השירות, מחיר וכפתור ביטול */}
//       <div className={classes.details_section}>
//         <h3 className={classes.service_name}>{app.serviceName}</h3>
//         {app.price && <span className={classes.price}>{app.price}</span>}
        
//         {/* כפתור הביטול יופיע רק אם הועברה פונקציית ביטול מהרשימה */}
//         {onCancel && (
//           <button className={classes.cancel_btn} onClick={onCancel}>
//             ביטול תור
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }
export default function AppCard({ app, onCancel }) {
  return (
    <div className={classes.appointment_card}>
      {/* 1. זמן */}
      <div className={classes.time_section}>
        <span className={classes.time}>{app.time}</span>
        <span className={classes.date}>{app.date}</span>
      </div>

      {/* 2. פרטים (ספר/לקוח) */}
      <div className={classes.info_section}>
        <span className={classes.barberName}>✂️ {app.barberName}</span>
        <span className={classes.clientName}>👤 לקוח: {app.customerName}</span>
      </div>

      {/* 3. שירות, מחיר וכפתור */}
      <div className={classes.details_section}>
        <h3 className={classes.service_name}>{app.serviceName}</h3>
        <span className={classes.price}>{app.price}</span>
        {onCancel && (
          <button className={classes.cancel_btn} onClick={onCancel}>ביטול</button>
        )}
      </div>
    </div>
  );
}