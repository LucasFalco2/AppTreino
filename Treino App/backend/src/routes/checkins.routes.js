const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole, requireOwnStudentOrAdmin } = require("../middleware/role");const {requirePlanFeature}=require("../middleware/plan");
const ctrl = require("../controllers/checkins.controller");

router.use(requireAuth);

router.post("/", requirePlanFeature("hasCheckin"), requireOwnStudentOrAdmin, ctrl.createCheckin);
router.get("/students/:studentId", requireOwnStudentOrAdmin, ctrl.listMyCheckins);

router.get("/pending", requireRole("ADMIN"), ctrl.listPendingCheckins);
router.patch("/:id/reply", requireRole("ADMIN"), ctrl.replyCheckin);

module.exports = router;
