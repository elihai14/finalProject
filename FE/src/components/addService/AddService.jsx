import { useEffect, useState } from "react";
import classes from "./addService.module.css";
import Swal from 'sweetalert2';
import { fetchUser } from "../../../js/mainFunctionView";
export default function AddService({ refresh , setRefresh}) {
  const [user , setUser] = useState({});
  const [globalServices, setGlobalServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    price: "",
    duration: "30",
  });

  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {

    fetchUser(setUser);
    fetch("http://localhost:5000/services/global")
      .then((res) => res.json())
      .then((data) => {
        setGlobalServices(data);

        if (data.length > 0) {
          setNewService((prev) => ({
            ...prev,
            serviceName: data[0].service_name,
          }));
        }
      });
  }, [refresh]);

  
  const handleAddService = async (e) => {
    e.preventDefault();

    if (!newService.serviceName || !newService.price) return;
    if(isLoading) return;
    setIsLoading(true);

    try {
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

        setRefresh(prev => !prev);

        setNewService((prev) => ({
          ...prev,
          price: "",
          duration: "30",
        }));
        
      } else {
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
      setIsLoading(false);
    };
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>הוספת שירות</h3>

      <form onSubmit={handleAddService} className={classes.form}>
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

        <input
          className={classes.input}
          type="number"
          placeholder="מחיר"
          value={newService.price}
          onChange={(e) =>
            setNewService({ ...newService, price: e.target.value })
          }
        />

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

        <button type="submit" className={classes.button} disabled={isLoading} > {isLoading ? "מוסיף..." : "הוסף +"} 
        </button>
      </form>
    </div>
  );
}