
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../config/db");
const { signToken } = require("../utils/jwt");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { student: true, admin: true },
    });

    // Mensagem genérica de propósito (não revela se o email existe)
    if (!user) {
      return res.status(401).json({
        error: "Email ou senha inválidos.",
      });
    }

    if (user.role === "STUDENT" && user.student) {
      const active = await prisma.subscription.findFirst({
        where: {
          studentId: user.student.id,
          status: "ACTIVE",
        },
        orderBy: {
          renewsAt: "desc",
        },
      });

      if (
        active?.renewsAt &&
        Date.now() >
          new Date(active.renewsAt).getTime() + 5 * 86400000
      ) {
        await prisma.subscription.update({
          where: {
            id: active.id,
          },
          data: {
            status: "EXPIRED",
          },
        });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            isActive: false,
          },
        });

        return res.status(401).json({
          error: "Sua assinatura expirou. Fale com o Lucas para renovar.",
        });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: "Email ou senha inválidos.",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Email ou senha inválidos.",
      });
    }

    const activePlan = user.student
      ? await prisma.subscription.findFirst({
          where: {
            studentId: user.student.id,
            status: "ACTIVE",
          },
          include: {
            plan: true,
          },
          orderBy: {
            renewsAt: "desc",
          },
        })
      : null;

    const token = signToken({
      userId: user.id,
      role: user.role,
      studentId: user.student?.id,
      onboardingCompleted: user.student?.onboardingCompleted,
      adminId: user.admin?.id,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user.id,
          role: user.role,
          name: user.student?.name || user.admin?.name,
          studentId: user.student?.id,
          onboardingCompleted: user.student?.onboardingCompleted,
          planFeatures: activePlan?.plan
            ? {
                hasTraining: activePlan.plan.hasTraining,
                hasTracking: activePlan.plan.hasTracking,
                hasCheckin: activePlan.plan.hasCheckin,
                hasNutrition: activePlan.plan.hasNutrition,
              }
            : {},
          planName: activePlan?.plan?.name || null,
        },
      });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      include: {
        student: {
          include: {
            subscriptions: {
              where: {
                status: "ACTIVE",
              },
              include: {
                plan: true,
              },
              orderBy: {
                renewsAt: "desc",
              },
            },
          },
        },
        admin: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado.",
      });
    }

    const plan = user.student?.subscriptions?.[0]?.plan;

    res.json({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.student?.name || user.admin?.name,
      studentId: user.student?.id,
      onboardingCompleted: user.student?.onboardingCompleted,
      planFeatures: plan
        ? {
            hasTraining: plan.hasTraining,
            hasTracking: plan.hasTracking,
            hasCheckin: plan.hasCheckin,
            hasNutrition: plan.hasNutrition,
          }
        : {},
      planName: plan?.name || null,
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie("token").json({
    ok: true,
  });
}

// Uso interno: criar acesso de aluno após confirmação de pagamento
// (chamado pelo fluxo de checkout, não exposto como rota pública de auto-registro)
async function createStudentAccount({
  email,
  password,
  name,
  phone,
}) {
  const existing = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (existing) {
    const err = new Error(
      "Já existe uma conta com este email."
    );
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role: "STUDENT",
      student: {
        create: {
          name,
          phone,
        },
      },
    },
    include: {
      student: true,
    },
  });
}

module.exports = {
  login,
  me,
  logout,
  createStudentAccount,
};

