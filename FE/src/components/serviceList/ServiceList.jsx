import React from 'react';

export default function ServiceList({
  isLoading,
  myServices,
  editingName,
  setEditingName,
  editForm,
  setEditForm,
  startEditing,
  handleUpdateService,
  handleDeleteService,
  classes
}) {
  return (
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
  );
}