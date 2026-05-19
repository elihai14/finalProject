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

function App() {
  const [user, setUser] = useState("");
  const [status, setStatus] = useState("");
  const location = useLocation();
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    // פונקציה אסינכרונית למשיכת הנתונים
    const fetchUserName = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/current", {
          credentials: "include",
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
          console.log(data, "data");

          setUser("");
        } else {
          const nameString = String(data.user_name);

          setUser(nameString); // שמירת הנתונים ב-State
        }
      } catch (error) {
        console.error("שגיאה", error);
      }
    };

    fetchUserName();
  }, [location.pathname]);
  useEffect(() => {
    // פונקציה אסינכרונית למשיכת הנתונים
    const fetchUserStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/users/get-status", {
          credentials: "include",
          method: "POST",
        });
        const data = await response.json();
        if (!response.ok) {
          console.log(data, "data");

          setStatus("");
        } else {
          const statusString = String(data.status);

          setStatus(statusString); // שמירת הנתונים ב-State
        }
      } catch (error) {
        console.error("שגיאה", error);
      }
    };

    fetchUserStatus();
  }, [location.pathname]);
  const [refreshAppointments, setRefreshAppointments] = useState(0);

  const triggerRefresh = () => {
    setRefreshAppointments((prev) => prev + 1);
  };

  return (
    <div>
      <Header />

      <Navbar user={user} setUser={setUser} status={status} setStatus={setStatus}/>

      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* שלושת הדאשבורדים מציגים את AppList הדינמית שמתאימה את עצמה לפי הסטטוס בעברית */}
        <Route path="/admin-dashboard" element={<AppList />} />
        <Route
          path="/manage-services"
          element={
            <div>
              <AddService setRefresh={setRefresh} /> <ServiceList refresh={refresh}/>
            </div>
          }
        />

        <Route
          path="/client-dashboard"
          element={
            <div>
              <NewAppForm onSuccess={triggerRefresh} />
              <AppList refresh={refreshAppointments} />
            </div>
          }
        />
        <Route path="/barber-dashboard" element= {<div>{<AppList />}{<DashboardStats userStatus={status} />}</div>}  />
      </Routes>

      <Footer prog="Elihai & Daniel" year="2026" />
    </div>
  );
}

export default App;
