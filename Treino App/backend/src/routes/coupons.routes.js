const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const {
  applyCoupon,
  createCoupon,
  listCoupons,
  updateCouponStatus,
  deleteCoupon,
} = require("../controllers/coupons.controller");

// Público — usado no checkout para pré-visualizar o desconto
router.post("/apply", applyCoupon);

// Admin — gestão de cupons
router.get("/", requireAuth, requireRole("ADMIN"), listCoupons);
router.post("/", requireAuth, requireRole("ADMIN"), createCoupon);
router.patch("/:id/status", requireAuth, requireRole("ADMIN"), updateCouponStatus);
router.delete("/:id", requireAuth, requireRole("ADMIN"), deleteCoupon);

module.exports = router;
