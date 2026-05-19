import Swal from "sweetalert2";

/**
 * 1. בדיקה האם המשתמש קיים בדאטהבייס לפי מייל
 */
export const checkUserEmail = async (email) => {
  try {
    const response = await fetch(`$/users/login`, {
      method: "POST",
      body: { mailAddress: email },
    });

    // נניח שהשרת מחזיר 200 אם נמצא ו-404 אם לא
    if (response.ok) {
      const data = await response.json();
      return data.exists; // מחזיר true/false
    }
    return false;
  } catch (error) {
    console.error("Error checking email:", error);
    throw new Error("נכשלה הבדיקה מול בסיס הנתונים");
  }
};

/**
 * 2. בקשת התחברות - יצירת קוד (OTP) ושליחתו למייל
 */
export const loginRequest = async (email) => {
  try {
    const response = await fetch(`${API_URL}/auth/login-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("נכשל בהפקה או שליחה של קוד האימות");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in loginRequest:", error);
    throw error;
  }
};

/**
 * 3. אימות קוד ה-OTP מול השרת
 */
export const verifyOTP = async (otpCode, email) => {
  try {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code: otpCode, email: email }),
    });

    if (response.ok) {
      const data = await response.json();
      // כאן בדרך כלל תקבל Token (JWT) ותשמור אותו ב-LocalStorage
      if (data.token) {
        localStorage.setItem("userToken", data.token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
};

/**
 * 4. בדיקה האם המשתמש הוא אדמין (לפי הדיאגרמה שלך)
 */
export const isMainAdmin = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/users/is-admin/${userId}`);
    const data = await response.json();
    return data.isAdmin;
  } catch (error) {
    return false;
  }
};

// פונקצייה מקבלת רשימת תורים קיימים ואת משך הזמן של השירות המבוקש ומחזירה מערך של שעות פנויות
function calculateSlots(
  existingApps,
  duration,
  date,
  start,
  end,
  availableSlots
) {
  console.log("start:", start);
  console.log("end:", end);
  console.log("duration:", duration);
  console.log("existingApps:", existingApps);
  const currentDate = new Date();
  const dateToCheck = new Date(date);

  const interval = 15;

  // עוזר: המרה ל־דקות
  const toMinutes = (t) => {
    if (typeof t === "number") return t; // כבר דקות
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  let startMin = toMinutes(start);
  let endMin = toMinutes(end);

  const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // אם זה היום → מתחילים מהשעה הנוכחית המעוגלת
  if (currentDate.toDateString() === dateToCheck.toDateString()) {
    if (nowMinutes > startMin) {
      startMin = Math.ceil(nowMinutes / interval) * interval;
    }

    if (nowMinutes >= endMin) {
      return availableSlots;
    }
  }

  // המרת תורים קיימים לדקות
  const busyTimes = existingApps.map((app) => {
    const [h, m] = app.appointment_time.split(":").map(Number);
    const startBusy = h * 60 + m;

    return {
      start: startBusy,
      end: startBusy + app.duration,
    };
  });

  // יצירת סלוטים
  for (
    let current = startMin;
    current <= endMin - duration;
    current += interval
  ) {
    const potentialEnd = current + duration;

    const isOverlap = busyTimes.some((busy) => {
      return current < busy.end && potentialEnd > busy.start;
    });

    if (!isOverlap) {
      const h = String(Math.floor(current / 60)).padStart(2, "0");
      const m = String(current % 60).padStart(2, "0");

      availableSlots.push(`${h}:${m}`);
    }
  }

  return availableSlots;
}
export async function getHoursSelect(barberMail, date, serviceName) {
  const constraintsRes = await fetch(
    `http://localhost:5000/constraints/barbers-constraints`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        bMail: barberMail,
        date: date,
      }),
    }
  );

  const constraints = await constraintsRes.json();

  const durationRes = await fetch(`http://localhost:5000/services/duration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      barberMail: barberMail,
      serviceName: serviceName,
    }),
    credentials: "include",
  });

  const { duration } = await durationRes.json();

  const appsRes = await fetch(
    `http://localhost:5000/appointments/existing-apps`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: date }),
      credentials: "include",
    }
  );

  const existingApp = await appsRes.json();

  let hours = [];

  if (constraints && constraints.length > 0) {
    constraints.forEach((c) => {
      calculateSlots(
        existingApp,
        duration,
        date,
        c.start_time,
        c.end_time,
        hours
      );
    });
  }

  return [...new Set(hours)];
}
export async function handleCreateApp(date, barberMail, time, service_name, 
                                      setSelectedBarber,setSelectedService,setSelectedDate,setSelectedHour,setHours
) {
  const constraint_code_response = await fetch(
    `http://localhost:5000/constraints/get-code`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        barberMail: barberMail,
        date: date,
        time: time,
      }),
    }
  );
  const code = await constraint_code_response.json();
  if (!constraint_code_response.ok) {
    console.error(code.message);
    Swal.fire({
      title: "שגיאה !",
      text: "מצטערים, קרתה שגיאה בקביעת התור",
      icon: "error",
      confirmButtonText: "הבנתי",
      confirmButtonColor: "#3085d6",
    });
    return ;
  }
  const price_response = await fetch(`http://localhost:5000/services/price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      barberMail: barberMail,
      serviceName: service_name,
    }),
  });
  const price = await price_response.json();
  if (!price_response.ok) {
    console.error(code.message);
    Swal.fire({
      title: "שגיאה !",
      text: "מצטערים, קרתה שגיאה בקביעת התור",
      icon: "error",
      confirmButtonText: "הבנתי",
      confirmButtonColor: "#3085d6",
    });
    return ;
  }

  const addAppResponse = await fetch(
    `http://localhost:5000/appointments/add-appointment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        constraintCode: code.constraint_code,
        barberMail: barberMail,
        service: service_name,
        date: date,
        time: time,
        price: price.price,
      }),
    }
  );
  const addApp = await addAppResponse.json();
  if(!addAppResponse.ok)
  {
    console.error(addApp.message);
    Swal.fire({
      title: "שגיאה !",
      text: "מצטערים, קרתה שגיאה בקביעת התור",
      icon: "error",
      confirmButtonText: "הבנתי",
      confirmButtonColor: "#3085d6",
    });
    return ;
  }
  Swal.fire({
    title: "התור נקבע בהצלחה",
    text: "התור נקבע בהצלחה ויופיע מייד ברשימת התורים",
    icon: "success",
    confirmButtonText: "מעולה !",
    confirmButtonColor: "#3085d6",
  });
  setSelectedBarber("");
  setSelectedService("");
  setSelectedDate("");
  setSelectedHour("");
  setHours([]);
}
