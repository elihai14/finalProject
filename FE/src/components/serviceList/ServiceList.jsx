import { useEffect, useState } from "react";
import classes from "./serviceList.module.css";

export default function ServiceList() {
  const [myServices, setMyServices] = useState([]);
  const [editingName, setEditingName] = useState(null);
  const [editForm, setEditForm] = useState({
    newPrice: "",
    newDuration: "30",
  });

  const userEmail = localStorage.getItem("userEmail");
  const fetchServices = async () => {
    try {
      const res = await fetch("http://localhost:5000/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberMail: userEmail }),
      });

      const data = await res.json();

      if (res.ok) setMyServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);


  const startEditing = (service) => {
    setEditingName(service.service_name);
    setEditForm({
      newPrice: service.price,
      newDuration: service.duration || "30",
    });
  };

  const handleUpdate = async (serviceName) => {
    await fetch("http://localhost:5000/services/update-service", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        serviceName,
        newPrice: editForm.newPrice,
        newDuration: editForm.newDuration,
        barberMail: userEmail,
      }),
    });

    setEditingName(null);
    fetchServices();
  };

  const handleDelete = async (serviceName) => {
    if (!window.confirm("למחוק שירות?")) return;

    await fetch("http://localhost:5000/services/remove-service", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ serviceName }),
    });

    fetchServices();
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>השירותים שלי</h3>

      <div className={classes.grid}>
        {myServices.length === 0 ? (
          <p className={classes.empty}>אין שירותים עדיין</p>
        ) : (
          myServices.map((s) => {
            const isEditing = editingName === s.service_name;

            return (
              <div key={s.service_name} className={classes.card}>
                <div className={classes.info}>
                  <h4>{s.service_name}</h4>

                  {!isEditing && (
                    <p>{s.duration} דקות</p>
                  )}
                </div>

                <div className={classes.center}>
                  {!isEditing ? (
                    <div className={classes.price}>₪{s.price}</div>
                  ) : (
                    <div className={classes.editBox}>
                      <input
                        type="number"
                        value={editForm.newPrice}
                        onChange={(e) =>
                          setEditForm({ ...editForm, newPrice: e.target.value })
                        }
                      />

                      <select
                        value={editForm.newDuration}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            newDuration: e.target.value,
                          })
                        }
                      >
                        <option value="15">15</option>
                        <option value="30">30</option>
                        <option value="45">45</option>
                        <option value="60">60</option>
                        <option value="90">90</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className={classes.actions}>
                  {!isEditing ? (
                    <>
                      <button
                        className={classes.editBtn}
                        onClick={() => startEditing(s)}
                      >
                        ערוך
                      </button>

                      <button
                        className={classes.deleteBtn}
                        onClick={() => handleDelete(s.service_name)}
                      >
                        מחק
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={classes.saveBtn}
                        onClick={() => handleUpdate(s.service_name)}
                      >
                        שמור
                      </button>

                      <button
                        className={classes.cancelBtn}
                        onClick={() => setEditingName(null)}
                      >
                        ביטול
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}