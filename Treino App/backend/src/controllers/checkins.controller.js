const { z } = require("zod");
const prisma = require("../config/db");

const checkinSchema = z.object({
  studentId: z.string().uuid(),
  mood: z.string().optional(),
  energyLevel: z.string().optional(),
  sleepQuality: z.string().optional(),
  followingWorkout: z.boolean().optional(),
  hasDifficulty: z.boolean().optional(),
  hasDiscomfort: z.boolean().optional(),
  motivation: z.string().optional(),
  message: z.string().optional(),
});

async function createCheckin(req, res, next) {
  try {
    const data = checkinSchema.parse(req.body);
    const checkin = await prisma.checkin.create({ data });

    if (data.message?.trim()) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (admin) await prisma.message.create({ data: { studentId: data.studentId, senderUserId: req.user.userId, receiverUserId: admin.id, body: `Check-in: ${data.message}` } });
    }

    // Notifica admin(s) — em produção, buscar todos usuários ADMIN
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title: "Novo check-in recebido",
        body: `Um aluno enviou um novo check-in.`,
      })),
    });

    res.status(201).json({ ...checkin, status: "SENT" });
  } catch (err) {
    next(err);
  }
}

async function listMyCheckins(req, res, next) {
  try {
    const checkins = await prisma.checkin.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { createdAt: "desc" },
    });
    res.json(checkins);
  } catch (err) {
    next(err);
  }
}

// Admin: pendentes (sem resposta ainda)
async function listPendingCheckins(req, res, next) {
  try {
    const checkins = await prisma.checkin.findMany({
      where: { status: "SENT" },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(checkins);
  } catch (err) {
    next(err);
  }
}

async function replyCheckin(req, res, next) {
  try {
    const { id } = req.params;
    const { reply } = z.object({ reply: z.string().min(1) }).parse(req.body);

    const checkin = await prisma.checkin.update({
      where: { id },
      data: { coachReply: reply, status: "ANSWERED", answeredAt: new Date() },
      include: { student: true },
    });

    await prisma.notification.create({
      data: {
        userId: checkin.student.userId,
        title: "Lucas respondeu seu check-in",
        body: reply,
      },
    });

    res.json(checkin);
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckin, listMyCheckins, listPendingCheckins, replyCheckin };
