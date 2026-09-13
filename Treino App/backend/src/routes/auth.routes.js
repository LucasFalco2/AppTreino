const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { login, me, logout } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");

// Proteção contra brute force no login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

router.post("/login", loginLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;
