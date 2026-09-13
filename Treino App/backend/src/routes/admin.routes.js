const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const adminCtrl = require("../controllers/admin.controller");
const { listLeads } = require("../controllers/leads.controller");

router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", adminCtrl.getDashboard);
router.get("/students", adminCtrl.listStudents);
router.post("/students", adminCtrl.createStudent);
router.patch("/students/:id/active", adminCtrl.toggleStudentActive);
router.patch("/students/:id/profile", adminCtrl.updateStudentProfile);
router.get("/leads", listLeads);

module.exports = router;
