import React, { useState, useEffect } from 'react';
import classes from './servicesManagement.module.css';

export default function ServicesManagement() {
  const [myServices, setMyServices] = useState([]); // השירותים של הספר המחובר
  const [globalServices, setGlobalServices] = useState([]); // כל השירותים הכלליים לקומבובוקס
  const [newService, setNewService] = useState({
    serviceName: '',
    price: '',
    duration: '30' // ברירת מחדל
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // סטייט לניהול מצב עריכה (Inline Edit)
  const [editingName, setEditingName] = useState(null);
  const [editForm, setEditForm] = useState({ newPrice: '', newDuration: '30' });

  // לוקחים את המייל של הספר מה-localStorage בשביל השליפה הראשונית
  const userEmail = localStorage.getItem("userEmail");

  // 1. טעינת כל השירותים הכלליים במערכת עבור הקומבובוקס
  const fetchGlobalServices = async () => {
    try {
      const res = await fetch('http://localhost:5000/services/global'); 
      const data = await res.json();
      if (res.ok) {
        setGlobalServices(data);
        if (data.length > 0) {
          setNewService(prev => ({ ...prev, serviceName: data[0].service_name }));
        }
      }
    } catch (err) {
      console.error("שגיאה בטעינת קטלוג השירותים הכללי", err);
    }
  };

  // 2. טעינת השירותים של הספר
  const fetchMyServices = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barberMail: userEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMyServices(data);
      } else {
        setMyServices([]); 
      }
    } catch (err) {
      console.error("שגיאה בטעינת השירותים האישיים", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalServices();
    fetchMyServices();
  }, [userEmail]);

  // 3. הוספת שירות חדש לספר - כולל credentials
  // 3. הוספת שירות חדש לספר - התיקון הכי בטוח ב-JSX שלך
const handleAddService = async (e) => {
  e.preventDefault();
  if (!newService.serviceName || !newService.price) {
    setMessage({ text: 'נא לבחור שירות ולהזין מחיר', type: 'error' });
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/services/barber/add-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      // 👈 שולחים את השדות בצורה מפורשת ומבטיחים שהמייל נכנס ראשון ותקין
      body: JSON.stringify({
        barberMail: userEmail, // המייל מה-localStorage של הדף
        serviceName: newService.serviceName,
        price: newService.price,
        duration: newService.duration
      }) 
    });
    const data = await res.json();

    if (res.ok) {
      setMessage({ text: data.message || 'השירות הוסף בהצלחה!', type: 'success' });
      setNewService(prev => ({
        ...prev,
        price: '',
        duration: '30'
      }));
      fetchMyServices(); 
    } else {
      setMessage({ text: data.message || 'שגיאה בהוספת השירות', type: 'error' });
    }
  } catch (err) {
    setMessage({ text: 'שגיאת תקשורת עם השרת', type: 'error' });
  }
};

  // 4. פתיחת מצב עריכה לשירות ספציפי - משתמש ב-duration האמיתי מה-DB
  const startEditing = (service) => {
    setEditingName(service.service_name);
    setEditForm({
      newPrice: service.price,
      newDuration: service.duration ? String(service.duration) : '30' // 👈 שואב את הזמן האמיתי מהשרת
    });
  };

  // 5. שמירת העדכון - כולל credentials
  const handleUpdateService = async (serviceName) => {
    try {
      const res = await fetch('http://localhost:5000/services/update-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👈 מאשר שליחת Session Cookie לשרת
        body: JSON.stringify({
          serviceName,
          newPrice: editForm.newPrice,
          newDuration: editForm.newDuration,
          barberMail: userEmail
        })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'השירות עודכן בהצלחה! השינוי תקף לתורים חדשים בלבד.', type: 'success' });
        setEditingName(null);
        fetchMyServices(); 
      } else {
        setMessage({ text: data.message || 'שגיאה בעדכון השירות', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'שגיאת תקשורת בעדכון השירות', type: 'error' });
    }
  };

  // 6. ביטול שירות (מחיקה לוגית) - כולל credentials
  const handleDeleteService = async (serviceName) => {
    const warningText = `שים לב! קיימים תורים לשירות זה במערכת.\nביטול השירות יסיר אותו מהתפריט שלך והוא לא יהיה זמין לקביעה מעתה והלאה.\n\nהאם אתה בטוח שברצונך לבטל את השירות?`;
    
    if (!window.confirm(warningText)) return;

    try {
      const res = await fetch('http://localhost:5000/services/remove-service', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 👈 מאשר שליחת Session Cookie לשרת
        body: JSON.stringify({ serviceName })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'השירות הוסר מהתפריט שלך בהצלחה!', type: 'success' });
        setMyServices(myServices.filter(service => service.service_name !== serviceName));
      } else {
        setMessage({ text: data.message || 'לא ניתן לבטל את השירות כרגע', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'שגיאת תקשורת בביטול השירות', type: 'error' });
    }
  };

  return (
    <div className={classes.management_container}>
      <h2 className={classes.main_title}>ניהול השירותים שלי</h2>
      <p className={classes.subtitle}>בחר שירות מקטלוג המספרה והגדר לו מחיר ומשך זמן. שינויים לא ישפיעו על תורים קיימים.</p>

      <form className={classes.add_service_form} onSubmit={handleAddService}>
        <div className={classes.form_group}>
          <label>בחר שירות מהמערכת:</label>
          <select
            value={newService.serviceName}
            onChange={(e) => setNewService({...newService, serviceName: e.target.value})}
          >
            {globalServices.map((gService, idx) => (
              <option key={idx} value={gService.service_name}>
                {gService.service_name}
              </option>
            ))}
          </select>
        </div>

        <div className={classes.form_group}>
          <label>המחיר שלך (₪):</label>
          <input 
            type="number" 
            placeholder="הזן מחיר..."
            value={newService.price}
            onChange={(e) => setNewService({...newService, price: e.target.value})}
          />
        </div>

        <div className={classes.form_group}>
          <label>משך זמן (דקות):</label>
          <select 
            value={newService.duration}
            onChange={(e) => setNewService({...newService, duration: e.target.value})}
          >
            <option value="15">15 דק'</option>
            <option value="30">30 דק'</option>
            <option value="45">45 דק'</option>
            <option value="60">שעה</option>
            <option value="90">שעה וחצי</option>
          </select>
        </div>

        <button type="submit" className={classes.add_btn}>הוסף לתפריט שלי +</button>
      </form>

      {message.text && (
        <div className={message.type === 'success' ? classes.success : classes.error}>
          {message.text}
        </div>
      )}

      <div className={classes.services_list_section}>
        <h3>השירותים הפעילים שלך בתפריט</h3>
        <div className={classes.services_grid}>
          {isLoading ? (
            <div className={classes.loading_text}>טוחן נתונים מהשרת...</div>
          ) : myServices.length === 0 ? (
            <div className={classes.no_services}>עדיין לא הוספת שירותים פעילים לתפריט האישי שלך.</div>
          ) : (
            myServices.map((service, index) => {
              const isEditing = editingName === service.service_name;

              return (
                <div key={index} className={classes.service_card}>
                  <div className={classes.service_info}>
                    <h4>{service.service_name}</h4>
                    
                    {isEditing ? (
                      <div className={classes.edit_fields}>
                        <label>משך זמן חדש:</label>
                        <select 
                          value={editForm.newDuration}
                          onChange={(e) => setEditForm({...editForm, newDuration: e.target.value})}
                        >
                          <option value="15">15 דק'</option>
                          <option value="30">30 דק'</option>
                          <option value="45">45 דק'</option>
                          <option value="60">שעה</option>
                          <option value="90">שעה וחצי</option>
                        </select>
                      </div>
                    ) : (
                      <div className={classes.service_duration_display}>
                        {service.duration ? `${service.duration} דקות` : '30 דקות'}
                      </div>
                    )}
                  </div>

                  <div className={classes.left_actions}>
                    {isEditing ? (
                      <div className={classes.edit_fields}>
                        <label>מחיר חדש ₪:</label>
                        <input 
                          type="number" 
                          className={classes.edit_price_input}
                          value={editForm.newPrice}
                          onChange={(e) => setEditForm({...editForm, newPrice: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div className={classes.service_price}>₪{service.price}</div>
                    )}

                    <div className={classes.action_buttons_group}>
                      {isEditing ? (
                        <>
                          <button type="button" className={classes.save_btn} onClick={() => handleUpdateService(service.service_name)}>שמור</button>
                          <button type="button" className={classes.cancel_edit_btn} onClick={() => setEditingName(null)}>ביטול</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className={classes.edit_btn} onClick={() => startEditing(service)}>עדכן</button>
                          <button type="button" className={classes.delete_btn} onClick={() => handleDeleteService(service.service_name)}>ביטול שירות</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}