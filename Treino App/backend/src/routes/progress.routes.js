const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const { requireAuth } = require("../middleware/auth");
const { requireOwnStudentOrAdmin, requireRole } = require("../middleware/role");
const { requirePlanFeature } = require("../middleware/plan");
const ctrl = require("../controllers/progress.controller");

const dir = path.join(process.cwd(), "uploads", "progress");

fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const d = path.join(dir, req.user.studentId);

      fs.mkdirSync(d, { recursive: true });

      cb(null, d);
    },

    filename: (req, file, cb) => {
      cb(null, randomUUID() + path.extname(file.originalname));
    },
  }),

  limits: {
    fileSize: 8 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
});

router.use(requireAuth);

// Registros de progresso
router.post(
  "/records",
  requirePlanFeature("hasTracking"),
  requireOwnStudentOrAdmin,
  ctrl.createRecord,
);

router.get(
  "/students/:studentId/records",
  requirePlanFeature("hasTracking"),
  requireOwnStudentOrAdmin,
  ctrl.listRecords,
);

// Fotos
router.post(
  "/students/:studentId/photos",
  requirePlanFeature("hasTracking"),
  requireOwnStudentOrAdmin,
  upload.single("photo"),
  ctrl.uploadPhoto,
);

router.get(
  "/students/:studentId/photos",
  requirePlanFeature("hasTracking"),
  requireOwnStudentOrAdmin,
  ctrl.listPhotos,
);

router.get("/photos/:id/file", requireAuth, ctrl.getPhotoFile);

router.delete("/photos/:id", requireAuth, ctrl.deletePhoto);

// Metas
router.post("/goals", requireRole("ADMIN"), ctrl.createGoal);

router.get(
  "/students/:studentId/goals",
  requireOwnStudentOrAdmin,
  ctrl.listGoals,
);

router.patch("/goals/:id", requireAuth, ctrl.updateGoal);

module.exports = router;
