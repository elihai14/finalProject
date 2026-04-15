const express = require("express");
const router = express.Router();

//routes/user.js
const dbSingleton = require("../dbSingleton");

// Execute a query to the database
const db = dbSingleton.getConnection();

router.post("/" , (req,res) =>{
    const { barberMail } = req.body;

    const query = "SELECT service_name , price FROM barber_services WHERE mail_address = ?";
    db.query(query, [barberMail] , (err, results) => {
        if(err){
            return res.status(500).json({ message: "Internal Server Error" });
        }
        if(results.length === 0)
        {
            return res.status(400).json({message: "There is no any service for this mail"});
        }

        return res.status(200).json(results);
    });
});

module.exports = router;