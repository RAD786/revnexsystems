import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_HOSTS = new Set([
  "revnexsystems.com",
  "revnexsystems.ai"
]);
const ROUTES = {
  "/": "index.html",
  "/aesthetiq": "aesthetiq.html",
  "/how-it-works": "how-it-works.html",
  "/pricing": "pricing.html",
  "/book-demo": "book-demo.html",
  "/contact": "contact.html"
};

app.use(express.json());
app.use((req, res, next) => {
  const host = req.headers.host || "";
  if (host.startsWith("www.")) {
    const rootHost = host.replace(/^www\./, "");
    if (ROOT_HOSTS.has(rootHost)) {
      return res.redirect(301, `https://${rootHost}${req.originalUrl}`);
    }
  }
  return next();
});
app.get(Object.keys(ROUTES), (req, res) => {
  const file = ROUTES[req.path];
  return res.sendFile(path.join(__dirname, file));
});
app.get(Object.values(ROUTES).map((file) => `/${file}`), (req, res) => {
  const target = Object.entries(ROUTES).find(([, file]) => `/${file}` === req.path);
  if (target) {
    return res.redirect(301, target[0]);
  }
  return res.redirect(301, "/");
});
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
