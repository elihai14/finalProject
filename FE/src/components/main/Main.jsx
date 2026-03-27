import classes from './main.module.css'
import NewAppForm from '../newAppForm/NewAppForm';
import AppList from '../appList/AppList';
/**
 * main component
 * @returns main jsx
 */
let appointment = {
  date: "12/10/2026",
  time: "08:00",
  serviceName: "Beard",
  price: 20,
  barberName: "Moshe",
};
export default 
function Main() {
  return (
    <main className={classes.main}>
      <NewAppForm />
      <AppList/>

    </main>
  );
}



