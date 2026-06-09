import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import classes from "./app.module.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import NewAppForm from "../components/newAppForm/NewAppForm";
import AppList from "../components/appList/AppList";
import LoginForm from "../components/loginForm/LoginForm";
import RegisterForm from "../components/registerForm/RegisterForm";
import DashboardStats from "../components/dashboardStats/DashboardStats";
import Navbar from "../components/navBar/NavBar";
import AddService from "../components/addService/AddService";
import ServiceList from "../components/serviceList/ServiceList";
import SideBar from "../components/sideBar/SideBar";
import { fetchUser } from "../../js/mainFunctionView";
import ConstraintList from "../components/constraintsList/ConstraintsList";
import AddConstraintForm from "../components/addConstraintForm/AddConstraintForm";
import UsersList from "../components/usersList/UsersList";
import UpdateDetailsForm from "../components/updateDetailsForm/UpdateDetailsForm";
import AdminServiceManager from "../components/adminServiceManager/AdminServiceManager";
import GlobalServicesList from "../components/globalServiceList/GlobalServiceList";

export default function App() {

  const [user, setUser] = useState(null); // התחל עם null ולא {}
  const [isLoading, setIsLoading] = useState(true); // מצב טעינה
  const location = useLocation();
  const [refresh, setRefresh] = useState(false); 
  const [refreshAppointments, setRefreshAppointments] = useState(0);
  const hideSidebarRoutes = ["/", "/login", "/register"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await fetchUser(setUser);
      console.log(user);
      
      setIsLoading(false);
    };
    checkAuth();
  }, [location.pathname]);

  // אם הנתונים בטעינה, לא נציג את הנאבבר או נציג משהו ריק
  if (isLoading) return <div>טוען...</div>; 

  return (
    <div>
      
      <Header />
      <Navbar user={user} setUser={setUser} />

      {shouldShowSidebar && <SideBar/>}
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/update" element={<UpdateDetailsForm />} />

        {/* שלושת הדאשבורדים מציגים את AppList הדינמית שמתאימה את עצמה לפי הסטטוס בעברית */}
        <Route path="/admin-dashboard" element={
            <div className={classes.page_container}>
              <div className={classes.form_column}>
                <div className={classes.card_wrapper}>
                  <DashboardStats userStatus={user?.status} />
                </div>
              </div>

              <div className={classes.list_column}>
                <div className={classes.card_wrapper}>
                  <AppList refresh={refreshAppointments} />
                </div>
              </div>
            </div>
          } />

        <Route
          path="/manage-services"
          element={
            <div className={classes.page_container}>
              <div className={classes.form_column}>
                <div className={classes.card_wrapper}>
                  <AddService setRefresh={setRefresh} />
                  {(user?.status === "מנהל") && <AdminServiceManager setRefresh={setRefresh}/>}
                </div>
              </div>

              <div className={classes.list_column}>
                <div className={classes.card_wrapper}>
                  <ServiceList refresh={refresh} />
                  {(user?.status === "מנהל") && <GlobalServicesList refresh={refresh}/>}
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
                    onSuccess={() => setRefreshAppointments((prev) => prev + 1)}
                  />
                </div>
              </div>

              <div className={classes.list_column}>
                <div className={classes.card_wrapper}>
                  <AppList refresh={refreshAppointments} />
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
                  <AppList refresh={refreshAppointments} />
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
                  <AddConstraintForm setRefresh ={setRefresh}/>
                </div>
              </div>

              <div className={classes.list_column}>
                <div className={classes.card_wrapper}>
                  <ConstraintList refresh={refresh} />
                </div>
              </div>
            </div>
          }
        />
        <Route path="/manage-users" element={<div>{<UsersList />}</div>} />
      </Routes>
      <Footer prog="Elihai & Daniel" year="2026" />
    </div>
  );
}

