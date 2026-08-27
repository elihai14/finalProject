// ייבוא קובץ העיצוב (CSS Module)
import classes from './main.module.css'
// ייבוא קומפוננטת הטופס לקביעת תור חדש
import NewAppForm from '../newAppForm/NewAppForm';
// ייבוא קומפוננטת הצגת רשימת התורים
import AppList from '../appList/AppList';
/**
 * main component
 * @returns main jsx
 */
// אובייקט לדוגמה של פרטי תור
let appointment = {
  date: "12/10/2026",
  time: "08:00",
  serviceName: "Beard",
  price: 20,
  barberName: "Moshe",
};
export default 
// הקומפוננטה המרכזית המאגדת את טופס נקודות התור ורשימת התורים
function Main() {
  return (
    <main className={classes.main}>
{/* טופס קביעת תור חדש */}
      <NewAppForm />
{/* רשימת התורים הקיימים */}
      <AppList/>

    </main>
  );
}