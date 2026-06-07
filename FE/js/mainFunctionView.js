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
      body: JSON.stringify({
        date: date,
        barberMail: barberMail,
      }),
      credentials: "include",
    },
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
export async function handleCreateApp(
  date,
  barberMail,
  time,
  service_name,
  setSelectedBarber,
  setSelectedService,
  setSelectedDate,
  setSelectedHour,
  setHours
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
    return;
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
    return;
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
  if (!addAppResponse.ok) {
    console.error(addApp.message);
    Swal.fire({
      title: "שגיאה !",
      text: "מצטערים, קרתה שגיאה בקביעת התור",
      icon: "error",
      confirmButtonText: "הבנתי",
      confirmButtonColor: "#3085d6",
    });
    return;
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

export function getHoursArr(startTime, endTime) {
  const result = [];

  // המרה לדקות
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current <= end) {
    const hours = Math.floor(current / 60)
      .toString()
      .padStart(2, "0");

    const minutes = (current % 60).toString().padStart(2, "0");

    result.push(`${hours}:${minutes}`);

    // קפיצה של רבע שעה
    current += 15;
  }

  return result;
}

export async function handleUpdateStatus(
  userMail,
  status,
  selectedStatus,
  refresh,
  setRefresh
) {
  if (status === selectedStatus) {
    Swal.fire({
      title: "לא בוצע שינוי",
      text: "למשתמש שבחרת כבר קיים סטטוס זה ",
      icon: "info",
      confirmButtonText: "הבנתי",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#555",
      cancelButtonColor: "#ef4444",
    });
    return;
  }

  if (selectedStatus === "מנהל") {
    const answer = await Swal.fire({
      title: "אזהרה",
      text: "שינוי זה יעניק למשתמש גישה מלאה למערכת, האם להמשיך ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "כן, להמשיך",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#555",
      cancelButtonColor: "#ef4444",
      cancelButtonText: "לא",
    });
    if (!answer.isConfirmed) return;
  }

  if (selectedStatus === "ספר") {
    const answer = await Swal.fire({
      title: "אזהרה",
      text: "שינוי זה יעניק למשתמש גישה מורחבת למערכת, האם להמשיך ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "כן, להמשיך",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#555",
      cancelButtonColor: "#ef4444",
      cancelButtonText: "לא",
    });
    if (!answer.isConfirmed) return;
  }

  const response = await fetch(`http://localhost:5000/users/updateStatus`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      status: selectedStatus,
      userEmail: userMail,
    }),
  });

  if (!response.ok) {
    Swal.fire({
      title: "שגיאה",
      text: "אירעה שגיאה בעדכון הסטטוס, נסו שנית מאוחר יותר",
      icon: "error",
      confirmButtonText: "הבנתי",
      background: "#1a1a1a",
      color: "#fff",
      confirmButtonColor: "#555",
    });
    return;
  }

  Swal.fire({
    title: "הפעולה הצליחה",
    text: "שינוי סטטוס המשתמש בוצע בהצלחה",
    icon: "success",
    confirmButtonText: "מעולה !",
    background: "#1a1a1a",
    color: "#fff",
    confirmButtonColor: "#555",
    cancelButtonColor: "#ef4444",
  });

  setRefresh(!refresh);
}

export async function getUsersList(status, isReverse) {
  const response = await fetch(`http://localhost:5000/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      status: status,
      isReverse: isReverse,
    }),
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
}

export async function handleUpdate(
  e,
  setIsLoading,
  setError,
  onClose,
  phone,
  email
) {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const response = await fetch("http://localhost:5000/users/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        phoneNumber: phone,
        newEmail: email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // הרשמה בוצעה בהצלחה - מעבר ללוגין
      Swal.fire({
        title: "פרטיך עודכנו בהצלחה",
        text: "פרטיך עודכנו בהצלחה !",
        icon: "success",
        confirmButtonText: "מעולה",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        onClose();
      });
    } else {
      // כאן נתפסת הבדיקה של הבקאנד (למשל: "משתמש כבר קיים")
      setError(data.message || "שגיאה בתהליך עדכון הפרטים ");
    }
  } catch (err) {
    setError("שגיאת תקשורת עם השרת");
  } finally {
    setIsLoading(false);
  }
}

export async function fetchUser(setUser) {
  try {
    const response = await fetch("http://localhost:5000/users/current", {
      credentials: "include",
      method: "POST",
    });

    // הגדרה אחת בלבד!
    const data = await response.json();

    if (!response.ok) {
      setUser(null);
    } else {
      setUser(data);
    }
  } catch (error) {
    console.error("שגיאה", error);
    setUser(null);
  }
}

export async function loadStartHours(day, setHours, setEndtTime) {
  try {
    const response = await fetch("http://localhost:5000/daysHours/get-day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        day: day,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setHours([]);
    } else {
      console.log(data);

      setHours(getHoursArr(data.start, data.end));
      setEndtTime(data.end);
    }
  } catch (error) {
    console.error("שגיאה בטעינת השעות:", error);
  }
}

export async function handleAddConstraint(
  e,
  selectedDate,
  setSelectedDate,
  setHours,
  startTime,
  setStartTime,
  setEndtTime,
  selectedEndTime,
  setSelectedEndTime,
  setEndHours,
  setRefresh
) {
  e.preventDefault();
  try {
    const response = await fetch(
      "http://localhost:5000/constraints/add-constraint",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: selectedDate,
          start_time: startTime,
          end_time: selectedEndTime,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error("שגיאה בהוספת האילוץ:", data.message);
    } else {
      setSelectedDate("");
      setHours([]);
      setStartTime("");
      setEndtTime("");
      setSelectedEndTime("");
      setEndHours([]);
      setRefresh(true);
    }
  } catch (error) {
    console.error("שגיאה בהוספת האילוץ:", error);
  }
}


  export async function fetchConstraints(
    setIsLoading,
    setConstraints,
    setError,
  ) {
    setIsLoading(true);
    // const requestBody = { ...filters };
    try {
      const response = await fetch(`http://localhost:5000/constraints`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (response.ok) {
        setConstraints(data);
      } else {
        setConstraints([]);
      }
    } catch (err) {
      setError("שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

    export async function handleCancelConstraint (
      id,
      setError,
      setSuccessMessage,
      setConstraints,
      constraints,

    ) {
      setError("");
      setSuccessMessage("");

      try {
        const response = await fetch(
          `http://localhost:5000/constraints/remove-constraint/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        console.log("Status:", response.status, "ID sent:", id);
        if (response.ok) {
          setSuccessMessage("האילוץ בוטל בהצלחה!");
          setConstraints(
            constraints.filter((cons) => cons.constraint_code !== id)
          );

          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        } else {
          setError("לא ניתן לבטל את התור כרגע");
        }
      } catch (err) {
        setError("שגיאת תקשורת בביטול התור");
      }
    };
