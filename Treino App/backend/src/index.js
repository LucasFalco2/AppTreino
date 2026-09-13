require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const leadsRoutes = require("./routes/leads.routes");
const plansRoutes = require("./routes/plans.routes");
const couponsRoutes = require("./routes/coupons.routes");
const workoutsRoutes = require("./routes/workouts.routes");
const progressRoutes = require("./routes/progress.routes");
const checkinsRoutes = require("./routes/checkins.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const nutritionRoutes = require("./routes/nutrition.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const adminRoutes = require("./routes/admin.routes");
const paymentsRoutes = require("./routes/payments.routes");
const messagesRoutes = require("./routes/messages.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const cron = require("node-cron");
const prisma = require("./config/db");
const { sendSubscriptionReminder } = require("./utils/mailer");

const app = express();

// ---- Segurança de baixo nível ----
app.use(helmet()); // Security headers + CSP básica
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // necessário para cookies HttpOnly
  })
);
app.use(express.json({ limit: "1mb" })); // limita payload — mitiga alguns DoS simples
app.use(cookieParser());
const path = require("path");
app.use("/uploads/videos", express.static(path.join(process.cwd(), "uploads", "videos")));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limit global (proteção adicional além do limiter específico do login)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- Rotas ----
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/attendance", attendanceRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(process.cwd(), "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => console.log(`Lucas Falco Training API rodando na porta ${PORT}`));


// Lembretes de vencimento: executa diariamente às 09:00. Configure SMTP no .env.
cron.schedule("0 9 * * *", async () => {
  try {
    const now = new Date(), limit = new Date(now.getTime() + 3*86400000);
    const subs = await prisma.subscription.findMany({
      where:{status:"ACTIVE",renewsAt:{gt:now,lte:limit},reminderSentAt:null},
      include:{plan:true,student:{include:{user:{select:{email:true}}}}}
    });
    for(const sub of subs){
      if(await sendSubscriptionReminder(sub)) await prisma.subscription.update({where:{id:sub.id},data:{reminderSentAt:new Date()}});
    }
  } catch(e){ console.error("[reminder]",e.message); }
});
