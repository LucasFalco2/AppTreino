const { z } = require("zod");
const prisma = require("../config/db");
const { validateCoupon } = require("../utils/coupon");

// POST /api/coupons/apply — checkout chama isso para pré-visualizar o desconto.
// O valor final REAL é sempre recalculado de novo no momento da confirmação
// do pagamento (ver payments.controller) — nunca confiar só nesta resposta.
async function applyCoupon(req, res, next) {
  try {
    const schema = z.object({ code: z.string().min(1), planId: z.string().uuid() });
    const { code, planId } = schema.parse(req.body);

    const result = await validateCoupon(code, planId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ---- Painel administrativo ----

const couponSchema = z.object({
  code: z.string().min(3),
  discountValue: z.number().int().min(1).max(100),
  planId: z.string().uuid().nullable().optional(),
  startsAt: z.string(),
  expiresAt: z.string(),
  usageLimit: z.number().int().positive().nullable().optional(),
  internalNote: z.string().optional(),
});

async function createCoupon(req, res, next) {
  try {
    const data = couponSchema.parse(req.body);
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountValue: data.discountValue,
        planId: data.planId || null,
        startsAt: new Date(data.startsAt),
        expiresAt: new Date(data.expiresAt),
        usageLimit: data.usageLimit ?? null,
        internalNote: data.internalNote,
      },
    });
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
}

async function listCoupons(req, res, next) {
  try {
    const coupons = await prisma.coupon.findMany({
      include: { plan: true, _count: { select: { usages: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(coupons);
  } catch (err) {
    next(err);
  }
}

async function updateCouponStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) }).parse(req.body);
    const coupon = await prisma.coupon.update({ where: { id }, data: { status } });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
}

async function deleteCoupon(req, res, next) {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { applyCoupon, createCoupon, listCoupons, updateCouponStatus, deleteCoupon };
