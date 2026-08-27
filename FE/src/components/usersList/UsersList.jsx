// ייבוא הוקים מ-React, קובץ ה-CSS, פונקציית טעינת רשימת משתמשים וקומפוננטת כרטיס משתמש
import { useState, useEffect } from "react";
import classes from "./usersList.module.css";
import { getUsersList } from "../../../js/mainFunctionView";
import UserCard from "../userCard/UserCard";

// קומפוננטת ניהול והצגת רשימת המשתמשים במערכת
export default function UsersList() {
// ניהול מצבים (States) של סינון, מיוון, רענון, חיפוש, רשימת משתמשים והודעות שגיאה
  const [isReverse, setIsReverse] = useState(false);
  const [status, setStatus] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [userToSearch,setUserToSearch] = useState("");

// סינון רשימת המשתמשים לפי מחרוזת החיפוש שהוזנה על ידי המשתמש
const filteredUsers = users.filter((user) =>
  user.user_name.startsWith(userToSearch)
);

// טעינת רשימת המשתמשים מהשרת בעת טעינת הקומפוננטה או בעת שינוי מסננים/רענון
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsersList(status, isReverse);
        if (data === null) {
          setError("תקלה בטעינת המשתמשים");
          setUsers([]);
        } else {
          // רק מעדכנים את הסטייט של המשתמשים, בלי משחקים עם משתנים מקומיים
          setUsers(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        setError("תקלה בתקשורת עם השרת");
      }
    };
    fetchUsers();
  }, [isReverse, status, refresh]);


// רינדור הממשק
  return (
    <div className={classes.users_container}>
      <div className={classes.main_card}>
        {/* אזור הפילטרים */}
        <div className={classes.filters_area}>
{/* תפריט סינון לפי סטטוס/תפקיד משתמש */}
          <select
            className={classes.status_select}
            onChange={(e) => setStatus(e.target.value)}
            value={status}
          >
            <option value="לקוח">לקוח</option>
            <option value="ספר">ספר</option>
            <option value="מנהל">מנהל</option>
            <option value="">הכל</option>
          </select>

{/* תפריט בירור כיוון המיון (א-ת / ת-א) */}
          <select
            className={classes.order_select}
            onChange={(e) => setIsReverse(e.target.value === "true")}
            value={isReverse}
          >
            <option value="false">א-ת</option>
            <option value="true">ת-א</option>
          </select>

{/* שדה חיפוש טקסטואלי לפי שם המשתמש */}
          <input
            className={classes.status_select}
            type="text"
            placeholder="חיפוש משתמש לפי שם"
            onChange={(e) => setUserToSearch(e.target.value)}
          ></input>
        </div>

        {/* שגיאות */}
        {error && <p className={classes.error_message}>{error}</p>}

        {/* רשימת המשתמשים - ה-map רץ ישירות כאן על מערך ה-users העדכני */}
        {!error && (
          <div className={classes.grid_layout}>
            {filteredUsers.map((user) => (
              <UserCard
                key={user.mail_address}
                user={user}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}