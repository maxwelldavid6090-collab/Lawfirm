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

async function sendEmail(submission, type) {
  if (!smtpUser || !smtpPass) {
    throw new Error("SMTP_USER and SMTP_PASS must be set to send email notifications.");
  }

  const subject = type === "booking"
    ? `New Consultation Booking Request from ${submission.name}`
    : `New Contact Message from ${submission.name}`;

  const bodyLines = [
    `<h2>${type === "booking" ? "Consultation Booking Request" : "Contact Message"}</h2>`,
    `<p><strong>Name:</strong> ${submission.name}</p>`,
    `<p><strong>Email:</strong> ${submission.email}</p>`,
  ];

  if (submission.subject) {
    bodyLines.push(`<p><strong>Subject:</strong> ${submission.subject}</p>`);
  }

  if (submission.phone) {
    bodyLines.push(`<p><strong>Phone:</strong> ${submission.phone}</p>`);
  }

  if (submission.preferred_date) {
    bodyLines.push(`<p><strong>Preferred Date / Time:</strong> ${submission.preferred_date}</p>`);
  }

  if (submission.topic) {
    bodyLines.push(`<p><strong>Practice Area:</strong> ${submission.topic}</p>`);
  }

  bodyLines.push(`<p><strong>Message:</strong><br/>${submission.message.replace(/\n/g, "<br/>")}</p>`);
  bodyLines.push(`<p><strong>Submitted:</strong> ${submission.created_at}</p>`);

  const mailOptions = {
    from: `"Maxwell & Associates Website" <${smtpUser}>`,
    to: recipientEmail,
    subject,
    html: bodyLines.join(""),
  };

  await transporter.sendMail(mailOptions);
}

router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }

  const submission = {
    name,
    email,
    subject,
    message,
    type: "contact",
    created_at: new Date().toISOString(),
  };

  try {
    await addContactAsync(submission);
  } catch (err) {
    console.error("Database error writing contact message:", err);
    return res.status(500).json({ message: "Unable to save your message." });
  }

  try {
    await sendEmail(submission, "contact");
    res.json({ message: "Thank you! Your message has been sent." });
  } catch (err) {
    console.error("Email notification error:", err);
    res.status(500).json({ message: "Your message was saved, but the email notification failed." });
  }
});

router.post("/booking", async (req, res) => {
  const { name, email, phone, preferred_date, topic, message } = req.body;

  if (!name || !email || !phone || !preferred_date || !topic || !message) {
    return res.status(400).json({ message: "Please fill in all booking fields." });
  }

  const submission = {
    name,
    email,
    phone,
    preferred_date,
    topic,
    message,
    type: "booking",
    created_at: new Date().toISOString(),
  };

  try {
    await addContactAsync(submission);
  } catch (err) {
    console.error("Database error writing booking request:", err);
    return res.status(500).json({ message: "Unable to save your booking request." });
  }

  try {
    await sendEmail(submission, "booking");
    res.json({ message: "Thank you! Your consultation request has been sent." });
  } catch (err) {
    console.error("Email notification error:", err);
    res.status(500).json({ message: "Your booking request was saved, but the email notification failed." });
  }
});

module.exports = router;
