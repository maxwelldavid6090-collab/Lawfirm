const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const db = require("../db");

const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || "maxwellandassociates50@gmail.com";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

function addContactAsync(contact) {
  return new Promise((resolve, reject) => {
    db.addContact(contact, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function sendContactEmail(contact) {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set to send email notifications.");
  }

  const mailOptions = {
    from: `"Maxwell & Associates Website" <${smtpUser}>`,
    to: recipientEmail,
    subject: `New Consultation Booking from ${contact.name}`,
    text: `New consultation booking request:\n\nName: ${contact.name}\nEmail: ${contact.email}\nMessage:\n${contact.message}\n\nSubmitted: ${contact.created_at}`,
    html: `
      <h2>New Consultation Booking Request</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Message:</strong><br/>${contact.message.replace(/\n/g, "<br/>")}</p>
      <p><strong>Submitted:</strong> ${contact.created_at}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

router.post("/contact", async (req, res) => {
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

  try {
    await addContactAsync(contact);
  } catch (err) {
    console.error("Database error writing contact message:", err);
    return res.status(500).json({ message: "Unable to save your message." });
  }

  try {
    await sendContactEmail(contact);
    res.json({ message: "Thank you! Your message has been sent." });
  } catch (err) {
    console.error("Email notification error:", err);
    res.status(500).json({ message: "Your message was saved, but the email notification failed." });
  }
});

module.exports = router;
