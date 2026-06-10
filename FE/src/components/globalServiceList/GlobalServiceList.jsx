import { useEffect, useState } from "react";
import classes from "./globalServiceList.module.css";
import Swal from "sweetalert2";

export default function GlobalServicesList({ refresh , setRefresh}) {
  const [services, setServices] = useState([]);

  // פונקציה להבאת כל השירותים מהמערכת
  const fetchGlobalServices = async () => {
    try {
      const res = await fetch("http://localhost:5000/services/global");
      const data = await res.json();
      if (res.ok) setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };

  useEffect(() => {
    fetchGlobalServices();
  }, [refresh]);

  // פונקציית מחיקה מהרשימה הכללית
  const handleDelete = async (serviceName) => {
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

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("http://localhost:5000/services/admin/remove-service", {
        method: "PUT", // בדרך כלל מחיקה מהמערכת תהיה DELETE
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceName }),
        credentials:"include"
      });

      if (res.ok) {
        Swal.fire({ icon: "success", title: "נמחק בהצלחה", background: "#1a1a1a", color: "#fff", timer: 2000, showConfirmButton: false });
        fetchGlobalServices();
        setRefresh(prev => !prev);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "שגיאה", text: "לא ניתן היה למחוק את השירות", background: "#1a1a1a", color: "#fff" });
    }
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>רשימת שירותים כללית</h3>

      <div className={classes.grid}>
        {services.length === 0 ? (
          <p className={classes.empty}>לא נמצאו שירותים במערכת</p>
        ) : (
          services.map((s) => (
            <div key={s.service_name} className={classes.card}>
              <div className={classes.info}>
                <h4>{s.service_name}</h4>
              </div>

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