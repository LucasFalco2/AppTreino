// Dados de demonstração — CLARAMENTE dados de teste, não usar em produção real.
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seed: criando dados de teste (marcados [TESTE])...");

  // ---- Planos ----
  const [planTreino, planAcompanhamento, planCompleto] = await Promise.all([
    prisma.plan.upsert({
      where: { code: "TREINO" },
      update: { priceCents: 500 },
      create: {
        code: "TREINO",
        name: "Treino",
        priceCents: 500,
        hasTraining: true,
        description: "Para quem precisa de um treino organizado e personalizado.",
      },
    }),
    prisma.plan.upsert({
      where: { code: "TREINO_ACOMPANHAMENTO" },
      update: { priceCents: 750 },
      create: {
        code: "TREINO_ACOMPANHAMENTO",
        name: "Treino + Acompanhamento",
        priceCents: 750,
        hasTraining: true,
        hasTracking: true,
        hasCheckin: true,
        description: "Treinamento adaptado com acompanhamento contínuo.",
      },
    }),
    prisma.plan.upsert({
      where: { code: "TREINO_COMPLETO" },
      update: { priceCents: 1000 },
      create: {
        code: "TREINO_COMPLETO",
        name: "Treino Completo",
        priceCents: 1000,
        hasTraining: true,
        hasTracking: true,
        hasCheckin: true,
        hasNutrition: true,
        isFeatured: true,
        description: "Treinamento, acompanhamento, rotina e controle alimentar.",
      },
    }),
  ]);

  // ---- Admin (Lucas) ----
  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "lucas@lucasfalcotraining.com" },
    update: {},
    create: {
      email: "lucas@lucasfalcotraining.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      admin: { create: { name: "Lucas Falco" } },
    },
  });

  if (process.env.SEED_DEMO !== "true") {
    console.log("Seed concluído sem dados de demonstração. Use SEED_DEMO=true para criar os alunos de teste.");
    return;
  }

  // ---- 10 exercícios [TESTE] ----
  const exerciseNames = [
    "Supino inclinado com halteres",
    "Supino reto com barra",
    "Agachamento livre",
    "Leg press 45°",
    "Puxada frente",
    "Remada curvada",
    "Desenvolvimento com halteres",
    "Rosca direta",
    "Tríceps corda",
    "Elevação lateral",
  ];
  const exercises = [];
  for (const name of exerciseNames) {
    let exercise = await prisma.exercise.findFirst({ where: { name } });
    if (!exercise) {
      exercise = await prisma.exercise.create({ data: { name, muscleGroup: "Geral" } });
    }
    exercises.push(exercise);
  }

  // ---- 3 alunos [TESTE] ----
  const studentSeeds = [
    { email: "aluno1@teste.com", name: "Thaise [TESTE]", plan: planCompleto },
    { email: "aluno2@teste.com", name: "Rafael [TESTE]", plan: planAcompanhamento },
    { email: "aluno3@teste.com", name: "Bianca [TESTE]", plan: planCompleto },
  ];

  const studentPasswordHash = await bcrypt.hash("Aluno@123", 12);
  const students = [];

  for (const s of studentSeeds) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: studentPasswordHash,
        role: "STUDENT",
        student: { create: { name: s.name, phone: "4198996206" } },
      },
      include: { student: true },
    });

    const activeSub = await prisma.subscription.findFirst({ where: { studentId: user.student.id, status: "ACTIVE" } });
    if (activeSub) await prisma.subscription.update({ where: { id: activeSub.id }, data: { planId: s.plan.id, startedAt: new Date(), renewsAt: new Date(Date.now() + 30 * 86400000) } });
    else await prisma.subscription.create({ data: { studentId: user.student.id, planId: s.plan.id, status: "ACTIVE", startedAt: new Date(), renewsAt: new Date(Date.now() + 30 * 86400000) } });

    students.push(user.student);
  }

  // ---- Treino de exemplo para o aluno 1 ----
  const workout = await prisma.workout.create({
    data: {
      studentId: students[0].id,
      title: "Treino ABC [TESTE]",
      days: {
        create: [
          {
            weekday: 1,
            title: "Peito + Tríceps",
            exercises: {
              create: [
                {
                  exerciseId: exercises[0].id,
                  sets: 4,
                  reps: "12",
                  restSeconds: 75,
                  coachNote: "Controlar a descida.",
                  order: 0,
                },
                {
                  exerciseId: exercises[8].id,
                  sets: 3,
                  reps: "15",
                  restSeconds: 60,
                  order: 1,
                },
              ],
            },
          },
        ],
      },
    },
    include: { days: { include: { exercises: true } } },
  });

  // ---- Algumas cargas registradas [TESTE] ----
  const workoutExerciseId = workout.days[0].exercises[0].id;
  const loads = [
    { loadKg: 20, reps: 12 },
    { loadKg: 22, reps: 12 },
    { loadKg: 24, reps: 10 },
    { loadKg: 26, reps: 10 },
  ];
  for (let i = 0; i < loads.length; i++) {
    await prisma.workoutLog.create({
      data: {
        studentId: students[0].id,
        workoutExerciseId,
        loadKg: loads[i].loadKg,
        reps: loads[i].reps,
        performedAt: new Date(Date.now() - (loads.length - i) * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ---- Registro de evolução [TESTE] ----
  await prisma.progressRecord.create({
    data: { studentId: students[0].id, weightKg: 70, waistCm: 80 },
  });

  // ---- Alimentos [TESTE] ----
  const foods = await Promise.all([
    prisma.food.create({
      data: { name: "Arroz branco cozido", portion: "100", unit: "g", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    }),
    prisma.food.create({
      data: { name: "Peito de frango grelhado", portion: "100", unit: "g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    }),
    prisma.food.create({
      data: { name: "Feijão carioca cozido", portion: "100", unit: "g", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
    }),
  ]);

  await prisma.meal.create({
    data: {
      studentId: students[2].id,
      category: "Almoço",
      items: {
        create: [
          { foodId: foods[0].id, quantity: 1 },
          { foodId: foods[1].id, quantity: 1.5 },
          { foodId: foods[2].id, quantity: 1 },
        ],
      },
    },
  });

  // ---- Cupons de exemplo ----
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.coupon.upsert({
    where: { code: "FAMILIA" },
    update: { discountValue: 100, startsAt: now, expiresAt: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999), status: "ACTIVE", planId: null },
    create: { code: "FAMILIA", discountValue: 100, startsAt: now, expiresAt: new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999), status: "ACTIVE", internalNote: "Cupom família — 100% em qualquer plano" },
  });

  await prisma.coupon.upsert({
    where: { code: "LUCAS10" },
    update: {},
    create: {
      code: "LUCAS10",
      discountValue: 10,
      startsAt: now,
      expiresAt: in30Days,
      usageLimit: 100,
      internalNote: "Campanha geral [TESTE]",
    },
  });

  await prisma.coupon.upsert({
    where: { code: "INSTAGRAM20" },
    update: {},
    create: {
      code: "INSTAGRAM20",
      discountValue: 20,
      planId: planTreino.id,
      startsAt: now,
      expiresAt: in30Days,
      usageLimit: 20,
      internalNote: "Campanha Instagram setembro [TESTE]",
    },
  });

  // ---- Feedback de exemplo ----
  await prisma.feedback.create({
    data: {
      studentId: students[1].id,
      category: "SUGGESTION",
      description: "Seria legal ter um modo escuro [TESTE].",
      priority: "LOW",
    },
  });

  console.log("Seed concluído. Login admin: lucas@lucasfalcotraining.com / Admin@123");
  console.log("Login aluno teste: aluno1@teste.com / Aluno@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
