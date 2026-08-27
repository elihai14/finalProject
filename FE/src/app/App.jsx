// ייבוא קומפוננטות תשתית ועיצוב
  import Footer from "../components/footer/Footer";
  import Header from "../components/header/Header";
  import classes from "./app.module.css";
// ייבוא רכיבי ניתוח נתיבים וראוטינג מ-React Router
  import { Routes, Route, useLocation } from "react-router-dom";
// ייבוא הוקים של React לניהול ספציפי של מצב ומעגל חיים
  import { useState } from "react";
  import { useEffect } from "react";
// ייבוא קומפוננטות הטפסים והמסכים השונים באפליקציה
  import NewAppForm from "../components/newAppForm/NewAppForm";
  import AppList from "../components/appList/AppList";
  import LoginForm from "../components/loginForm/LoginForm";
  import RegisterForm from "../components/registerForm/RegisterForm";
  import DashboardStats from "../components/dashboardStats/DashboardStats";
  import Navbar from "../components/navBar/NavBar";
  import AddService from "../components/addService/AddService";
  import ServiceList from "../components/serviceList/ServiceList";
  import SideBar from "../components/sideBar/SideBar";
// ייבוא פונקציית השליפה הכללית לאימות משתמש מחובר
  import { fetchUser } from "../../js/mainFunctionView";
  import AvailabilityList from "../components/availabilityList/AvailabilityList";
  import AddAvailabilityForm from "../components/addAvailabilityForm/AddAvailabilityForm";
  import UsersList from "../components/usersList/UsersList";
  import UpdateDetailsForm from "../components/updateDetailsForm/UpdateDetailsForm";
  import AdminAddService from "../components/adminAddService/AdminAddService";
  import GlobalServicesList from "../components/globalServiceList/GlobalServiceList";
import DaysHoursManagement from "../components/daysHoursManagement/DaysHoursManagement";

// קומפוננטת השורש הראשית של האפליקציה
  export default function App() {

// ניהול ה-סטייט הראשי של המשתמש, טעינה ורענון נתונים
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); // מצב טעינה
    const location = useLocation();
    const [refresh, setRefresh] = useState(false); 
    const [refreshAppointments, setRefreshAppointments] = useState(0);
// הגדרת נתיבים שבהם סרגל הצד יהיה מוסתר
    const hideSidebarRoutes = ["/", "/login", "/register"];
// בדיקה האם להציג את סרגל הצד בהתאם לנתיב הנוכחי
    const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);
    const [reloadApps, setReloadApps] = useState(true);

    const day = {
      day: "ראשון",
      start:"08:00",
      end: "16:00"
    }


// useEffect לאימות סטטוס התחברות המשתמש בכל שינוי נתיב (URL)
    useEffect(() => {
      const checkAuth = async () => {
        setIsLoading(true);
        await fetchUser(setUser);
        
        setIsLoading(false);
      };
      checkAuth();
    }, [location.pathname]);

    // אם הנתונים בטעינה, לא נציג את הנאבבר או נציג משהו ריק
    if (isLoading) return <div>טוען...</div>; 

    return (
      <div>
        <div className={classes.topNavWrapper}>
          {/* <Header  /> */}
{/* סרגל ניווט עליון עם העברת פרטי משתמש ופונקציית עדכון */}
          <Navbar user={user} setUser={setUser} />
        </div>

{/* רנדור מותנה של סרגל הצד לפי הנתיב הנוכחי */}
        {shouldShowSidebar && <SideBar />}
{/* הגדרת נתיבי הראוטינג המרכזיים באפליקציה */}
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/update" element={<UpdateDetailsForm />} />

          {/* שלושת הדאשבורדים מציגים את רשימת התורים הדינמית שמתאימה את עצמה לפי הסטטוס בעברית */}
          <Route
            path="/admin-dashboard"
            element={
              <div className={classes.page_container}>
                <div className={classes.form_column}>
                  <div className={classes.card_wrapper}>
                    <DashboardStats userStatus={user?.status} />
                  </div>
                </div>

                <div className={classes.list_column}>
                  <div className={classes.card_wrapper}>
                    <AppList
                      refresh={refreshAppointments}
                      reloadApps={reloadApps}
                      setReloadApps={setReloadApps}
                    />
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/manage-services"
            element={
              <div className={classes.page_container}>
                <div className={classes.form_column}>
                  <div className={classes.card_wrapper}>
                    <AddService refresh={refresh} setRefresh={setRefresh} />
{/* תצוגת רכיבי מנהל בלבד בהתאם להרשאות משתמש */}
                    {user?.status === "מנהל" && (
                      <AdminAddService setRefresh={setRefresh} />
                    )}
                  </div>
                </div>

                <div className={classes.list_column}>
                  <div className={classes.card_wrapper}>
                    <ServiceList refresh={refresh} />
{/* תצוגת רשימת שירותים גלובלית למנהלים בלבד */}
                    {user?.status === "מנהל" && (
                      <GlobalServicesList
                        refresh={refresh}
                        setRefresh={setRefresh}
                      />
                    )}
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/client-dashboard"
            element={
              <div className={classes.page_container}>
                <div className={classes.form_column}>
                  <div className={classes.card_wrapper}>
                    <NewAppForm
                      setReloadApps={setReloadApps}
                      onSuccess={() =>
                        setRefreshAppointments((prev) => prev + 1)
                      }
                    />
                  </div>
                </div>

                <div className={classes.list_column}>
                  <div className={classes.card_wrapper}>
                    <AppList
                      refresh={refreshAppointments}
                      reloadApps={reloadApps}
                      setReloadApps={setReloadApps}
                    />
                  </div>
                </div>
              </div>
            }
          />

          <Route
            path="/barber-dashboard"
            element={
              <div className={classes.page_container}>
                <div className={classes.form_column}>
                  <div className={classes.card_wrapper}>
                    <DashboardStats userStatus={user?.status} />
                  </div>
                </div>

                <div className={classes.list_column}>
                  <div className={classes.card_wrapper}>
                    <AppList
                      refresh={refreshAppointments}
                      reloadApps={reloadApps}
                      setReloadApps={setReloadApps}
                    />
                  </div>
                </div>
              </div>
            }
          />
          <Route
            path="/barbers-constraints"
            element={
              <div className={classes.page_container}>
                <div className={classes.form_column}>
                  <div className={classes.card_wrapper}>
                    <AddAvailabilityForm setRefresh={setRefresh} />
                  </div>
                </div>

                <div className={classes.list_column}>
                  <div className={classes.card_wrapper}>
                    <AvailabilityList refresh={refresh} />
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/manage-users" element={<div>{<UsersList />}</div>} />
          <Route
            path="/manage-days-hours"
            element={
              <div>{<DaysHoursManagement setRefresh={setRefresh} />}</div>
            }
          />
        </Routes>
        <Footer prog="Elihai & Daniel" year="2026" />
      </div>
    );
  }