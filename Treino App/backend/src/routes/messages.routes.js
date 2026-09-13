const router=require("express").Router();const {requireAuth}=require("../middleware/auth");const {requireOwnStudentOrAdmin,requireRole}=require("../middleware/role");const c=require("../controllers/messages.controller");
router.use(requireAuth);
router.get("/:studentId",requireOwnStudentOrAdmin,c.list);
router.post("/:studentId",requireOwnStudentOrAdmin,c.send);
module.exports=router;
