const prisma = require("../config/db");

// GET /api/plans — usado na landing page / página de planos
async function listPlans(req, res, next) {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { priceCents: "asc" } });
    res.json(plans);
  } catch (err) {
    next(err);
  }
}

module.exports = { listPlans };
