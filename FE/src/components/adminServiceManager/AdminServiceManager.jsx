import { useEffect, useState } from "react";
import classes from "./adminServiceManager.module.css";
import Swal from 'sweetalert2';

export default function AdminServiceManager({ setRefresh }) {
  const [userEmail, setUserEmail] = useState("");
  const [newService, setNewService] = useState({ serviceName: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.serviceName || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/services/admin/add-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          barberMail: userEmail,
          serviceName: newService.serviceName,
        }),
      });

      const data = await res.json();
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#1a1a1a',
        color: '#fff'
      });

      if (res.ok) {
        Toast.fire({
          icon: 'success',
          title: data.message || 'השירות הוסף בהצלחה!',
          iconColor: '#d4af37'
        });
        setNewService({ serviceName: "" });
        setRefresh(prev => !prev);
      } else {
        Toast.fire({
          icon: 'warning',
          title: data.message || 'השירות כבר קיים בתפריט שלך!',
          iconColor: '#bfa15f'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>הוספת שירות</h3>

      <form onSubmit={handleAddService} className={classes.form}>
        <input
          type="text"
          className={classes.select}
          placeholder="הכנס שם שירות..."
          value={newService.serviceName}
          onChange={(e) => setNewService({ serviceName: e.target.value })}
        />

        <button type="submit" className={classes.button} disabled={isLoading}>
          {isLoading ? "מוסיף..." : "הוסף +"}
        </button>
      </form>
    </div>
  );
}