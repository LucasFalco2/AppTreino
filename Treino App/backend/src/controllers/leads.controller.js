const { z } = require("zod");
const prisma = require("../config/db");
const { notifyAdminNewLead } = require("../utils/mailer");

const leadSchema = z.object({
  name: z.string().min(2),
  whatsapp: z.string().min(8),
  objective: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.string().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  origin: z.enum(["SITE", "INSTAGRAM", "TIKTOK", "REFERRAL", "GOOGLE", "OTHER"]).default("SITE"),
  notes: z.string().optional(),
});

// POST /api/leads — formulário "Quero saber mais" (público, sem pagamento)
async function createLead(req, res, next) {
  try {
    const data = leadSchema.parse(req.body);
    const lead = await prisma.lead.create({ data });

    // Nunca bloquear a resposta ao usuário caso o email falhe
    notifyAdminNewLead(lead).catch((e) => console.error("Falha ao notificar admin:", e));

    res.status(201).json({
      message: "Recebemos suas informações! Em breve entraremos em contato pelo WhatsApp.",
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/leads — painel administrativo
async function listLeads(req, res, next) {
  try {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    res.json(leads);
  } catch (err) {
    next(err);
  }
}

module.exports = { createLead, listLeads };
