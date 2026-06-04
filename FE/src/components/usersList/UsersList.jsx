import { useState } from "react";
import classes from "./usersList.module.css";
import { useEffect } from "react";
import { getUsersList } from "../../../js/mainFunctionView";
import UserCard from "../userCard/UserCard";

export default function UsersList() {
  const [isReverse, setIsReverse] = useState(false);
  const [status, setStatus] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  let arr;
  useEffect(() => {
    // פונקציה אסינכרונית פנימית
    const fetchUsers = async () => {
      try {
        const data = await getUsersList(status, isReverse);

        if (data === null) {
          setError("תקלה בטעינת המשתמשים");
          setUsers([]);
        } else {
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

  return (
    <div className={classes.users_container}>
      <div>
        <select
          className={classes.status_select}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="לקוח">לקוח</option>
          <option value="ספר">ספר</option>
          <option value="מנהל">מנהל</option>
          <option value="" selected>
            הכל
          </option>
        </select>

        <select
          className={classes.order_select}
          onChange={(e) => setIsReverse(e.target.value)}
        >
          <option value="false" selected>
            א-ת
          </option>
          <option value="true">ת-א</option>
        </select>
      </div>
      {/* 2. אם יש שגיאה, נציג אותה */}
      {error && <p className={classes.error_message}>{error}</p>}

      {/* 3. רינדור רשימת המשתמשים מתוך הסטייט */}
      {!error &&
        users.map((user) => <UserCard key={user.mail_address} user={user} refresh={refresh} setRefresh={setRefresh} />)}
    </div>
  );
}
