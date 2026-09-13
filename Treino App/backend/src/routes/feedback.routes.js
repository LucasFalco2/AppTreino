const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole, requireOwnStudentOrAdmin } = require("../middleware/role");
const ctrl = require("../controllers/feedback.controller");

router.use(requireAuth);

router.post("/", requireOwnStudentOrAdmin, ctrl.createFeedback);
router.patch("/:id/reply", requireRole("ADMIN"), ctrl.replyFeedback);
router.patch("/:id/edit", requireRole("ADMIN"), ctrl.updateFeedbackResponse);
router.get("/", requireRole("ADMIN"), ctrl.listFeedbacks);

module.exports = router;
