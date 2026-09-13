const router=require("express").Router();const {requireAuth}=require("../middleware/auth");const {requireRole}=require("../middleware/role");const c=require("../controllers/payments.controller");
router.post("/",c.createPayment);
router.use(requireAuth,requireRole("ADMIN"));
router.get("/",c.listPayments);router.patch("/:id/approve",c.approvePayment);router.patch("/:id/reject",c.rejectPayment);router.get("/subscriptions",c.listSubscriptions);
module.exports=router;
