import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("."));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, company, phone, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await transporter.sendMail({
      from: `"RevNex Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_TO || process.env.GMAIL_USER,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "-"}`,
        `Phone: ${phone || "-"}`,
        "",
        message
      ].join("\n")
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Contact form email failed:", error);
    return res.status(500).json({ error: "Failed to send message." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
