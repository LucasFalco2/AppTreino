const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { listMyNotifications, markAsRead } = require("../controllers/notifications.controller");

router.use(requireAuth);

router.get("/", listMyNotifications);
router.patch("/:id/read", markAsRead);

module.exports = router;
