const prisma = require("../config/db");

/**
 * Valida um cupom no backend e retorna o preço final.
 * NUNCA confiar em desconto calculado pelo frontend — sempre recalcular aqui
 * no momento da confirmação do pagamento.
 *
 * @param {string} code - código do cupom digitado pelo usuário
 * @param {string} planId - id do plano sendo comprado
 * @returns {{ coupon: object, discountValue: number, finalPriceCents: number }}
 */
async function validateCoupon(code, planId) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) {
    const err = new Error("Plano inválido.");
    err.status = 400;
    throw err;
  }

  if (!code) {
    return { coupon: null, discountValue: 0, finalPriceCents: plan.priceCents };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon) {
    const err = new Error("Código de desconto inválido.");
    err.status = 400;
    throw err;
  }

  const now = new Date();

  if (coupon.status !== "ACTIVE" || now < coupon.startsAt) {
    const err = new Error("Código de desconto inválido.");
    err.status = 400;
    throw err;
  }

  if (now > coupon.expiresAt) {
    const err = new Error("Este código de desconto expirou.");
    err.status = 400;
    throw err;
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    const err = new Error("Este código atingiu o limite de utilizações.");
    err.status = 400;
    throw err;
  }

  if (coupon.planId && coupon.planId !== planId) {
    const err = new Error("Este código não é válido para este plano.");
    err.status = 400;
    throw err;
  }

  const discountCents = Math.round((plan.priceCents * coupon.discountValue) / 100);
  const finalPriceCents = Math.max(plan.priceCents - discountCents, 0);

  return { coupon, discountValue: coupon.discountValue, finalPriceCents, discountCents };
}

/**
 * Registra o uso de um cupom de forma atômica (evita corrida/uso simultâneo
 * indevido ao ultrapassar o limite). Deve ser chamado dentro de uma
 * transação, junto com a confirmação do pagamento.
 */
async function registerCouponUsage(tx, couponId, studentId) {
  // Lê o cupom dentro da própria transação e só incrementa se ainda houver
  // saldo de uso — evita estouro de limite em requisições concorrentes.
  const coupon = await tx.coupon.findUnique({ where: { id: couponId } });

  if (!coupon) {
    const err = new Error("Cupom não encontrado.");
    err.status = 400;
    throw err;
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    const err = new Error("Este código atingiu o limite de utilizações.");
    err.status = 400;
    throw err;
  }

  // Recomendação para produção: rodar esta transação com isolationLevel
  // "Serializable" (Prisma $transaction) para garantir atomicidade total
  // sob alta concorrência.
  await tx.coupon.update({
    where: { id: couponId },
    data: { usageCount: { increment: 1 } },
  });

  await tx.couponUsage.create({ data: { couponId, studentId } });
}

module.exports = { validateCoupon, registerCouponUsage };
