const router=require("express").Router();const {requireAuth}=require("../middleware/auth");const {requireOwnStudentOrAdmin,requireRole}=require("../middleware/role");const c=require("../controllers/attendance.controller");
router.use(requireAuth);router.get("/me",c.my);router.get("/admin",requireRole("ADMIN"),c.admin);module.exports=router;
