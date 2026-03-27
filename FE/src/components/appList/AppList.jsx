import AppCard from '../appCard/AppCard';
import classes from './appList.module.css'

export default function AppList () {
  const appointments = [
    {
      id: 1,
      serviceName: "תספורת גבר",
      barberName: "משה",
      date: "26/07/2026",
      time: "10:30",
      price: "₪70",
    },
    {
      id: 2,
      serviceName: "עיצוב זקן",
      barberName: "אוראל",
      date: "27/06/2026",
      time: "12:00",
      price: "₪30",
    },
    {
      id: 3,
      serviceName: "צבע שיער",
      barberName: "אלכס",
      date: "30/09/2026",
      time: "13:00",
      price: "₪150",
    },
  ];

  let arr = appointments.map((app) => (
        <AppCard key={app.id} app = {app}/>
  ));
  return (
    <div className={classes.appList}>
      {arr}
    </div>
  );
};