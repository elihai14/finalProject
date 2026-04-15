const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const session = require("express-session");
const { json } = require("body-parser");
//routes/user.js
const dbSingleton = require('../dbSingleton');

// Execute a query to the database
const db = dbSingleton.getConnection();

router.post("/", (req, res) => {
  const query = "SELECT * FROM users";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  });
});

router.post("/login", (req, res) => {
  const { mailAddress } = req.body;

  const query = "SELECT * FROM users WHERE mail_address = ?";
  db.query(query, [mailAddress], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length > 0) {
      return res.status(200).json({message : "User Exists"})
    } else {
      return res.status(400).json({ message: "User Not Exists" });
    }
  });
});

router.get("/:status", (req, res) => {
  const status = req.params.status;
  const query = "SELECT * FROM users WHERE status = ?";
  db.query(query, [status], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (results.length > 0) {
      return res.status(200).json(results);
    } else {
      return res
        .status(404)
        .json({ message: "No users found with this status" });
    }
  });
});

router.put("/updateStatus", (req, res) => {

  const {status , userEmail} = req.body;

  const query = "UPDATE users SET status = ? WHERE mail_address = ?";
  db.query(query, [status, userEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Status updated successfully for " + userEmail });
  });
});

router.put("/update", (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.email) {
    return res.status(401).json({ message: "Unauthorized: Please log in" });
  }

  const oldEmail = req.session.user.email;
  const { newEmail, phoneNumber } = req.body;

  if (!newEmail || !phoneNumber) {
    return res
      .status(400)
      .json({ message: "New email and phone number are required" });
  }

  const query =
    "UPDATE users SET mail_address = ?, phone_number = ? WHERE mail_address = ?";

  db.query(query, [newEmail, phoneNumber, oldEmail], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error updating profile" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    req.session.user.email = newEmail;

    return res.status(200).json({
      message: "Profile updated successfully",
      updatedEmail: newEmail,
    });
  });
});

module.exports = router;
