const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const contact = {
    name,
    email,
    message,
    created_at: new Date().toISOString(),
  };

  db.addContact(contact, (err) => {
    if (err) {
      console.error("Database error writing contact message:", err);
      return res.status(500).json({ message: "Unable to save your message." });
    }

    res.json({ message: "Thank you! Your message has been sent." });
  });
});

module.exports = router;
