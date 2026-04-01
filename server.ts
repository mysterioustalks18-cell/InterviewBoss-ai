import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import nodemailer from "nodemailer";
import axios from "axios";

import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const USERS_FILE = path.join(DATA_DIR, "users.json");
const RESUMES_FILE = path.join(DATA_DIR, "resumes.json");
const INTERVIEWS_FILE = path.join(DATA_DIR, "interviews.json");
const SECURITY_AUDITS_FILE = path.join(DATA_DIR, "security_audits.json");

const loadData = (file: string) => {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e);
      return [];
    }
  }
  return [];
};

const saveData = (file: string, data: any) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "personaos-secret-key";
const CSRF_SECRET = process.env.CSRF_SECRET || "personaos-csrf-secret";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));

// CSRF Configuration
const csrf: any = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  cookieName: "psid_csrf_secret",
  cookieOptions: {
    httpOnly: true,
    sameSite: "none",
    path: "/",
    secure: true,
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getSessionIdentifier: (req: any) => "personaos-session", // Required by types
  getCsrfTokenFromRequest: (req: any) => req.headers["x-csrf-token"],
});

const {
  invalidCsrfTokenError,
  generateToken,
  doubleCsrfProtection,
} = csrf;

// CSRF Token Endpoint
app.get("/api/csrf-token", (req, res) => {
  const token = csrf.generateToken(req, res);
  res.json({ csrfToken: token });
});

// Persistent database
const users: any[] = loadData(USERS_FILE);
const resumes: any[] = loadData(RESUMES_FILE);
const interviews: any[] = loadData(INTERVIEWS_FILE);
const securityAudits: any[] = loadData(SECURITY_AUDITS_FILE);

// Email Transporter (Lazy initialization)
let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Fallback to Ethereal for demo if no SMTP config provided
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("Ethereal SMTP configured for demo. User:", testAccount.user);
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
};

const sendVerificationEmail = async (email: string, token: string, name: string) => {
  const transporter = await getTransporter();
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const verificationLink = `${appUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"PersonaOS" <noreply@personaos.com>',
    to: email,
    subject: "Verify your PersonaOS Account",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #a855f7;">Welcome to PersonaOS, ${name}!</h2>
        <p>Thank you for signing up. To complete your registration and unlock full access to the PersonaOS Evolution Engine, please verify your email address.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't create an account with PersonaOS, you can safely ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  if (process.env.SMTP_HOST === undefined) {
    console.log("Verification email sent (Ethereal):", nodemailer.getTestMessageUrl(info));
  }
};

const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
  const transporter = await getTransporter();
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"PersonaOS" <noreply@personaos.com>',
    to: email,
    subject: "Reset your PersonaOS Password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #a855f7;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your PersonaOS account. If you didn't make this request, you can safely ignore this email.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #a855f7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  if (process.env.SMTP_HOST === undefined) {
    console.log("Password reset email sent (Ethereal):", nodemailer.getTestMessageUrl(info));
  }
};

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  if (token === 'mock-token') {
    req.user = { id: 'mock-id', email: 'guest@personaos.com', name: 'Guest User', isVerified: true };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// Apply CSRF protection to all non-ignored methods
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token === 'mock-token') {
    return next();
  }

  if (req.path.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return doubleCsrfProtection(req, res, next);
  }
  next();
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    
    const user = { 
      id: Date.now().toString(), 
      email, 
      password: hashedPassword, 
      name,
      isVerified: false,
      verificationToken
    };
    users.push(user);
    saveData(USERS_FILE, users);

    await sendVerificationEmail(email, verificationToken, name);

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified },
      message: "Registration successful. Please check your email to verify your account."
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isVerified: user.isVerified }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, isVerified: user.isVerified } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Verification token is required" });

    let decoded: any;
    try {
      decoded = jwt.verify(token as string, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }

    const user = users.find(u => u.email === decoded.email && u.verificationToken === token);
    if (!user) return res.status(400).json({ message: "User not found or token mismatch" });

    if (user.isVerified) return res.status(200).json({ message: "Email already verified" });

    user.isVerified = true;
    user.verificationToken = undefined;
    saveData(USERS_FILE, users);

    res.json({ message: "Email verified successfully. You can now access all features." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Email already verified" });

    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    user.verificationToken = verificationToken;
    saveData(USERS_FILE, users);

    await sendVerificationEmail(email, verificationToken, user.name);

    res.json({ message: "Verification email resent. Please check your inbox." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = users.find(u => u.email === email);

    if (!user) {
      // For security, don't reveal if user exists
      return res.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    saveData(USERS_FILE, users);

    await sendPasswordResetEmail(email, resetToken, user.name);

    res.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token as string, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const user = users.find(u => u.email === decoded.email && u.resetToken === token);
    
    if (!user || (user.resetTokenExpiry && user.resetTokenExpiry < Date.now())) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    saveData(USERS_FILE, users);

    res.json({ message: "Password reset successful. You can now login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  
  res.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      isVerified: user.isVerified 
    } 
  });
});

// Feature Routes (Protected)
app.get("/api/resumes", authenticateToken, (req: any, res) => {
  const userResumes = resumes.filter(r => r.userId === req.user.id);
  res.json(userResumes);
});

app.post("/api/resumes", authenticateToken, (req: any, res) => {
  const resume = { ...req.body, id: Date.now().toString(), userId: req.user.id };
  resumes.push(resume);
  saveData(RESUMES_FILE, resumes);
  res.status(201).json(resume);
});

app.get("/api/interviews", authenticateToken, (req: any, res) => {
  const userInterviews = interviews.filter(i => i.userId === req.user.id);
  res.json(userInterviews);
});

app.post("/api/interviews", authenticateToken, (req: any, res) => {
  const interview = { ...req.body, id: Date.now().toString(), userId: req.user.id };
  interviews.push(interview);
  saveData(INTERVIEWS_FILE, interviews);
  res.status(201).json(interview);
});

app.get("/api/security-audits", authenticateToken, (req: any, res) => {
  const userAudits = securityAudits.filter(a => a.userId === req.user.id);
  res.json(userAudits);
});

app.post("/api/security-audits", authenticateToken, (req: any, res) => {
  const audit = { ...req.body, id: Date.now().toString(), userId: req.user.id };
  securityAudits.push(audit);
  saveData(SECURITY_AUDITS_FILE, securityAudits);
  res.status(201).json(audit);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handler for CSRF (Must be after all routes)
  app.use((err: any, req: any, res: any, next: any) => {
    if (err && (err.code === "EBADCSRFTOKEN" || err === invalidCsrfTokenError)) {
      console.warn("CSRF Error:", err.message || "Invalid token");
      return res.status(403).json({
        message: "Invalid CSRF token. Please refresh the page.",
      });
    }
    
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
