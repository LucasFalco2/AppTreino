const router=require("express").Router();const {requireAuth}=require("../middleware/auth");const c=require("../controllers/onboarding.controller");
router.use(requireAuth);
router.get("/me",c.me);router.post("/",c.save);
module.exports=router;
