const router = require("express").Router();
const { requireAuth } = require("../middleware/auth");
const { requireRole, requireOwnStudentOrAdmin } = require("../middleware/role");const {requirePlanFeature}=require("../middleware/plan");
const ctrl = require("../controllers/nutrition.controller");

router.use(requireAuth);

// IMPORTANTE: em produção, adicionar middleware que verifica se o plano do
// aluno tem hasNutrition = true antes de liberar estas rotas (ver seção
// "controle de acesso por plano" do spec) — nunca confiar só no frontend.

router.get("/foods", ctrl.searchFoods);
router.post("/meals", requirePlanFeature("hasNutrition"), requireOwnStudentOrAdmin, ctrl.createMeal);
router.patch("/meals/:id", requirePlanFeature("hasNutrition"), ctrl.updateMeal);
router.delete("/meals/:id", requirePlanFeature("hasNutrition"), ctrl.deleteMeal);
router.get(
  "/students/:studentId/daily-summary",
  requirePlanFeature("hasNutrition"),
  requireOwnStudentOrAdmin,
  ctrl.getDailySummary
);
router.post("/food-requests", requireOwnStudentOrAdmin, ctrl.createFoodRequest);

router.post("/admin/foods", requireRole("ADMIN"), ctrl.createFood);
router.get("/admin/food-requests", requireRole("ADMIN"), ctrl.listFoodRequests);
router.patch("/admin/food-requests/:id", requireRole("ADMIN"), ctrl.updateFoodRequestStatus);

module.exports = router;
