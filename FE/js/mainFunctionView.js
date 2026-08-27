/**
 * mainFunctions.js
 * קובץ פונקציות עזר מרכזי .
 * מכיל פונקציות פנייה לשרת, חישובי זמינות שעות, ניהול תורים, אילוצים וסטטיסטיקות.
 */

import Swal from "sweetalert2";

// פונקציה הבודקת את תקינות המייל של המשתמש
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

// פונקצייה מקבלת רשימת תורים קיימים ואת משך הזמן של השירות המבוקש ומחזירה מערך של שעות פנויות
function calculateSlots(
  existingApps,
  duration,
  date,
  start,
  end,
  availableSlots,
) {
  const currentDate = new Date();
  const dateToCheck = new Date(date);

  const interval = 15;

  // עוזר: המרה לדקות
  const toMinutes = (t) => {
    if (typeof t === "number") return t; // כבר דקות
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  let startMin = toMinutes(start);
  let endMin = toMinutes(end);

  const nowMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

  // אם זה היום מתחילים מהשעה הנוכחית המעוגלת
  if (currentDate.toDateString() === dateToCheck.toDateString()) {
    // עיגול שעת ההתחלה כלפי מעלה לפי המרווח (15 דקות)
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

    // בדיקה האם הטווח המוצע חופף לתור קיים
    const isOverlap = busyTimes.some((busy) => {
      return current < busy.end && potentialEnd > busy.start;
    });

    if (!isOverlap) {
      // המרה חזרה מפורמט דקות למחרוזת HH:MM
      const h = String(Math.floor(current / 60)).padStart(2, "0");
      const m = String(current % 60).padStart(2, "0");

      availableSlots.push(`${h}:${m}`);
    }
  }

  return availableSlots;
}

// פונקצייה מקבלת כתובת מייל של ספר, תאריך, שם שירות, כתובת מייל של לקוח
//  ומחזירה מערך מחרוזות המייצג את השעות הפנויות לקביעת תור
export async function getHoursSelect(
  barberMail,
  date,
  serviceName,
  clientMail,
) {
  const availabilityRes = await fetch(
    `http://localhost:5000/availability/barbers-constraints`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        bMail: barberMail,
        date: date,
      }),
    },
  );

  const availability = await availabilityRes.json();

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
        clientMail: clientMail,
      }),
      credentials: "include",
    },
  );

  const existingApp = await appsRes.json();

  let hours = [];

  if (availability && availability.length > 0) {
    availability.forEach((c) => {
      calculateSlots(
        existingApp,
        duration,
        date,
        c.start_time,
        c.end_time,
        hours,
      );
    });
  }

  // סינון ערכים כפולים במערך השעות
  return [...new Set(hours)];
}

// פונקצייה מקבלת פרטי תור ומוסיפה אותו לבסיס הנתונים
export async function handleCreateApp(
  date,
  barberMail,
  time,
  service_name,
  setSelectedBarber,
  setSelectedService,
  setSelectedDate,
  setSelectedHour,
  setHours,
  setReloadApps,
) {
  const constraint_code_response = await fetch(
    `http://localhost:5000/availability/get-code`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        barberMail: barberMail,
        date: date,
        time: time,
      }),
    },
  );
  const code = await constraint_code_response.json();
  if (!constraint_code_response.ok) {
    console.error(code.message);
    Swal.fire({
      title: "שגיאה !",
      text: "מצטערים, קרתה שגיאה בקביעת התור",
      icon: "error",
      confirmButtonText: "הבנתי",
      confirmButtonColor: "#dfb76c",
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
      confirmButtonColor: "#dfb76c",
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
    },
  );
  const addApp = await addAppResponse.json();
  if (!addAppResponse.ok) {
    console.error(addApp.message);
    Swal.fire({
      title: "שגיאה !",
      text: "מצטערים, קרתה שגיאה בקביעת התור",
      icon: "error",
      confirmButtonText: "הבנתי",
      confirmButtonColor: "#dfb76c",
    });
    return;
  }
  Swal.fire({
    title: "התור נקבע בהצלחה",
    text: "התור נקבע בהצלחה ויופיע מייד ברשימת התורים",
    icon: "success",
    confirmButtonText: "מעולה !",
    confirmButtonColor: "#dfb76c",
  });
  // איפוס שדות הטופס ורענון רשימת התורים
  setSelectedBarber("");
  setSelectedService("");
  setSelectedDate("");
  setSelectedHour("");
  setHours([]);
  setReloadApps((prev) => !prev);
}

// פונקצייה מקבלת שעת התחלה ושעת סיום
// ומחזירה מערך מחרוזות המייצג את כל השעות בטווח בהפרשים של 15 דקות
export function getHoursArr(startTime, endTime) {
  const result = [];

  // המרה לדקות
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current <= end) {
    // יצירת פורמט מרופד באפסים HH:MM
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

// פונקצייה מקבלת פרטי משתמש וסטטוס חדש ומעדכנת את סטטוס המשתמש לסטטוס החדש
export async function handleUpdateStatus(
  userMail,
  status,
  selectedStatus,
  refresh,
  setRefresh,
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

// פונקצייה המחזירה את רשימת המשתמשים לפי סטטוס וכיוון מיון
export async function getUsersList(status, isReverse) {
  const response = await fetch(`http://localhost:5000/users/`, {
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

// פונקצייה המעדכנת את פרטי המשתמש המחובר (שם וטלפון)
export async function handleUpdate(e, setIsLoading, setError, phone, name) {
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
        newName: name,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // הרשמה בוצעה בהצלחה - מעבר ללוגין
      Swal.fire({
        title: "העדכון הצליח!",
        text: "פרטיך עודכנו במערכת בהצלחה",
        icon: "success",
        confirmButtonText: "מעולה",
        confirmButtonColor: "#dfb76c", // צבע הזהב שלך
        background: "#1a1a1a", // רקע כהה תואם לאתר
        color: "#ffffff", // טקסט לבן שיהיה קריא
        iconColor: "#dfb76c",
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

// פונקצייה המביאה את פרטי המשתמש המחובר כרגע
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

// פונקצייה המביאה את שעות הפעילות ליום ספציפי
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
      setHours(getHoursArr(data.start, data.end));
      setEndtTime(data.end);
    }
  } catch (error) {
    console.error("שגיאה בטעינת השעות:", error);
  }
}

// פונקצייה המוסיפה זמינות חדשה לספר
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
  setRefresh,
) {
  e.preventDefault();
  try {
    const response = await fetch(
      "http://localhost:5000/availability/add-constraint",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: selectedDate,
          start_time: startTime,
          end_time: selectedEndTime,
        }),
      },
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
      setRefresh((prev) => !prev);
    }
  } catch (error) {
    console.error("שגיאה בהוספת האילוץ:", error);
  }
}

// פונקצייה המביאה את רשימת אילוצי הזמינות לפי סינון
export async function fetchAvailability(
  setIsLoading,
  setAvailability,
  setError,
  filters,
) {
  setIsLoading(true);

  try {
    // בניית ה-URL בצורה דינמית כדי לא לשלוח פרמטרים ריקים
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await fetch(
      `http://localhost:5000/availability?${params.toString()}`,
      {
        method: "GET",
        credentials: "include", // שומר על ה-session
      },
    );
    const data = await response.json();
    if (response.ok) {
      setAvailability(data);
    } else {
      setAvailability([]);
    }
  } catch (err) {
    console.log(err);

    setError("שגיאה");
  } finally {
    setIsLoading(false);
  }
}

// פונקצייה המבטלת אילוץ זמינות קיים
export async function handleCancelConstraint(
  id,
  setError,
  setSuccessMessage,
  setAvailability,
  availability,
) {
  setError("");
  setSuccessMessage("");

  const result = await Swal.fire({
    title: "האם לבטל את הזמינות ?",
    text: "הזמינות תבוטל ותורים תואמים יבוטלו גם כן.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dfb76c",
    cancelButtonColor: "#ef4444",
    confirmButtonText: "כן, בטל אילוץ",
    cancelButtonText: "לא, חזור",
    background: "#1a1a1a",
    color: "#fff",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `http://localhost:5000/availability/remove-constraint/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      console.log("Status:", response.status, "ID sent:", id);

      if (response.ok) {
        // עדכון הסטייט המקומי כדי שהאילוץ ייעלם מיד מהמסך
        setAvailability(
          availability.filter((cons) => cons.constraint_code !== id),
        );

        Swal.fire({
          title: "בוטל!",
          text: "הזמינות בוטלה בהצלחה.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#fff",
        });
      } else {
        // אם השרת החזיר שגיאה, נציג פופאפ שגיאה
        Swal.fire({
          title: "אופס...",
          text: "לא ניתן לבטל את הזמינות כרגע",
          icon: "error",
          confirmButtonColor: "#dfb76c",
          background: "#1a1a1a",
          color: "#fff",
        });
        setError("לא ניתן לבטל את הזמינות כרגע");
      }
    } catch (err) {
      // אם יש שגיאת תקשורת
      Swal.fire({
        title: "שגיאה",
        text: "שגיאת תקשורת בביטול הזמינות",
        icon: "error",
        confirmButtonColor: "#dfb76c",
        background: "#1a1a1a",
        color: "#fff",
      });
      setError("שגיאת תקשורת בביטול האילוץ");
    }
  }
}

// פונקצייה המביאה נתונים סטטיסטיים ואנליטיקה עבור דשבורד מנהל/ספר
export async function getStatisticData(
  today,
  dashDates,
  prevMonth,
  setChartData,
  userStatus,
  setRepeatCount,
  setLoading,
) {
  setLoading(true);

  fetch("http://localhost:5000/appointments/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      startDate: dashDates.startDate || prevMonth,
      endDate: dashDates.endDate || today,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      setChartData(data);

      // שליפת נתוני לקוחות חוזרים במידה והמשתמש הוא מנהל
      if (userStatus === "מנהל") {
        return fetch(
          "http://localhost:5000/appointments/analytics/repeat-customers",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              startDate: dashDates.startDate || prevMonth,
              endDate: dashDates.endDate || today,
            }),
          },
        ).then((res) => res.json());
      }
    })
    .then((repeatData) => {
      if (repeatData) setRepeatCount(repeatData.repeatCount || 0);
      setLoading(false);
    })
    .catch((err) => {
      console.error("שגיאה בטעינת הנתונים:", err);
      setLoading(false);
    });
}

// 1. פונקציה להבאת תורים (הפונקציה המרכזית)
export async function fetchAppointments(
  customFilters,
  setIsLoading,
  setError,
  user,
  setAppointments,
) {
  setIsLoading(true);
  setError("");

  // התאמת גוף הבקשה לפי הסטטוס וההרשאות של המשתמש המחובר
  const requestBody = { ...customFilters };
  if (user.status === "ספר") requestBody.barber_mail = user.mail_address;
  else if (user.status === "לקוח") requestBody.clientMail = user.mail_address;

  try {
    const response = await fetch("http://localhost:5000/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    setAppointments(response.ok ? data : []);
  } catch (err) {
    setError("שגיאה בטעינת הנתונים");
    setAppointments([]);
  } finally {
    setIsLoading(false);
  }
}

// פונקצייה המביאה את אפשרויות הסינון לתורים (שירותים, ספרים ולקוחות)
export async function fetchFilterOptions(
  user,
  setServices,
  setBarbers,
  setCustomers,
) {
  try {
    const requestBody = {};
    if (user.status === "ספר") requestBody.barber_mail = user.mail_address;
    else if (user.status === "לקוח") requestBody.clientMail = user.mail_address;

    const response = await fetch("http://localhost:5000/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    if (response.ok) {
      // חילוץ שירותים ייחודיים בלבד ללא כפילויות
      setServices([
        ...new Set(data.map((app) => app.service_name).filter(Boolean)),
      ]);
      // חילוץ ספרים ייחודיים לפי כתובת מייל
      setBarbers(
        data
          .map((app) => ({
            user_name: app.barberName,
            mail_address: app.barber_mail_address,
          }))
          .filter(
            (barber, index, self) =>
              barber.mail_address &&
              index ===
                self.findIndex((b) => b.mail_address === barber.mail_address),
          ),
      );
      // חילוץ לקוחות ייחודיים בלבד
      setCustomers([
        ...new Set(data.map((app) => app.customerName).filter(Boolean)),
      ]);
    }
  } catch (err) {
    console.error("Filter options error:", err);
  }
}

// פונקציית ביטול תור
export async function handleCancelAppointment(
  id,
  getApps,
  filters,
  setReloadApps,
) {
  const result = await Swal.fire({
    title: "האם לבטל את התור?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#dfb76c",
    cancelButtonColor: "#ef4444",
    confirmButtonText: "כן, בטל תור",
    cancelButtonText: "לא, חזור",
    background: "#1a1a1a",
    color: "#fff",
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(
        `http://localhost:5000/appointments/cancel/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.ok) {
        await Swal.fire({
          title: "בוצע!",
          text: "התור בוטל בהצלחה.",
          icon: "success",
          background: "#1a1a1a",
          color: "#fff",
          confirmButtonColor: "#dfb76c",
        });
        getApps(filters); // רענון רשימה
        setReloadApps(false);
      } else {
        Swal.fire("שגיאה", "לא הצלחנו לבטל את התור.", "error");
      }
    } catch (err) {
      Swal.fire("שגיאה", "תקלה בשרת.", "error");
    }
  }
}

// פונקצייה המביאה את פרטי הספר לפי כתובת המייל שלו
export async function fetchBarberDetails(barberMail) {
  try {
    const response = await fetch(
      `http://localhost:5000/users/barber-details/${encodeURIComponent(barberMail)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch barber details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching barber details:", error);
    return null;
  }
}

// פונקצייה המביאה את ימות השבוע ושעות הפעילות שלהם
export async function getDays() {
  const response = await fetch(`http://localhost:5000/daysHours/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
}
