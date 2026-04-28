
/**
 * 1. בדיקה האם המשתמש קיים בדאטהבייס לפי מייל
 */
export const checkUserEmail = async (email) => {
  try {
    const response = await fetch(`$/users/login`,{
        method:'POST',
        body:{mailAddress:email}
    }
    );
    
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: otpCode, email: email })
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