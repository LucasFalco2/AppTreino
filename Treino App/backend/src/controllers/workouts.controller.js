const { z } = require("zod");

const prisma = require("../config/db");

const { mark } = require("./attendance.controller");

const path = require("path");

const fs = require("fs");

const exerciseDataSchema = z.object({
  name: z.string().trim().min(2),
  muscleGroup: z.string().trim().optional(),
  instructions: z.string().optional(),
});

const exerciseItemSchema = z.object({
  exerciseId: z.string().uuid(),
  sets: z.number().int().positive(),
  reps: z.string().min(1),
  restSeconds: z.number().int().nonnegative(),
  coachNote: z.string().nullable().optional(),
  order: z.number().int().nonnegative().default(0),
});

const daySchema = z.object({
  id: z.string().uuid().optional(),
  weekday: z.number().int().min(0).max(6),
  title: z.string().trim().min(1),
  exercises: z.array(exerciseItemSchema),
});

const workoutSchema = z.object({
  studentId: z.string().uuid(),
  title: z.string().trim().min(2),
  days: z.array(daySchema).min(1),
});

async function getActiveWorkout(req, res, next) {
  try {
    const { studentId } = req.params;

    const workout = await prisma.workout.findFirst({
      where: {
        studentId,
        isActive: true,
      },
      include: {
        days: {
          include: {
            exercises: {
              include: {
                exercise: {
                  include: {
                    videos: {
                      orderBy: {
                        createdAt: "desc",
                      },
                    },
                  },
                },
                completions: {
                  where: {
                    studentId,
                  },
                  orderBy: {
                    completedAt: "desc",
                  },
                  take: 1,
                },
              },
              orderBy: {
                order: "asc",
              },
            },
          },
          orderBy: {
            weekday: "asc",
          },
        },
      },
    });

    if (!workout) {
      return res.json(null);
    }

    const workoutExerciseIds = workout.days.flatMap((day) =>
      day.exercises.map((exercise) => exercise.id)
    );

    let logs = [];

    if (workoutExerciseIds.length > 0) {
      logs = await prisma.workoutLog.findMany({
        where: {
          studentId,
          workoutExerciseId: {
            in: workoutExerciseIds,
          },
        },
        orderBy: {
          performedAt: "desc",
        },
      });
    }

    const lastLoadByExercise = new Map();

    for (const log of logs) {
      if (!lastLoadByExercise.has(log.workoutExerciseId)) {
        lastLoadByExercise.set(log.workoutExerciseId, log);
      }
    }

    const workoutWithLastLoads = {
      ...workout,
      days: workout.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((exercise) => ({
          ...exercise,
          lastLoad: lastLoadByExercise.get(exercise.id) || null,
        })),
      })),
    };

    res.json(workoutWithLastLoads);
  } catch (err) {
    next(err);
  }
}

const logSchema = z.object({
  studentId: z.string().uuid(),
  workoutExerciseId: z.string().uuid(),
  loadKg: z.number().positive(),
  reps: z.number().int().positive(),
  note: z.string().optional(),
});

async function registerLoad(req, res, next) {
  try {
    const data = logSchema.parse(req.body);

    const exercise = await prisma.workoutExercise.findFirst({
      where: {
        id: data.workoutExerciseId,
        workoutDay: {
          workout: {
            studentId: data.studentId,
            isActive: true,
          },
        },
      },
    });

    if (!exercise) {
      return res
        .status(403)
        .json({ error: "Exercício não pertence ao treino ativo deste aluno." });
    }

    const log = await prisma.workoutLog.create({
      data,
    });

    await mark(data.studentId);

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

async function completeExercise(req, res, next) {
  try {
    const { studentId, workoutExerciseId } = req.body;

    if (!studentId || !workoutExerciseId) {
      return res
        .status(400)
        .json({ error: "Dados do exercício incompletos." });
    }

    const exercise = await prisma.workoutExercise.findFirst({
      where: {
        id: workoutExerciseId,
        workoutDay: {
          workout: {
            studentId,
            isActive: true,
          },
        },
      },
    });

    if (!exercise) {
      return res
        .status(403)
        .json({ error: "Exercício não pertence ao seu treino ativo." });
    }

    const completion = await prisma.workoutExerciseCompletion.upsert({
      where: {
        student_workout_exercise_completion: {
          studentId,
          workoutExerciseId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        studentId,
        workoutExerciseId,
      },
    });

    await mark(studentId);

    res.status(201).json(completion);
  } catch (err) {
    next(err);
  }
}

async function getLoadHistory(req, res, next) {
  try {
    const { studentId } = req.params;
    const { exerciseId, from, to } = req.query;

    const logs = await prisma.workoutLog.findMany({
      where: {
        studentId,
        performedAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
        ...(exerciseId
          ? {
              workoutExercise: {
                exerciseId,
              },
            }
          : {}),
      },
      include: {
        workoutExercise: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: {
        performedAt: "asc",
      },
    });

    res.json(logs);
  } catch (err) {
    next(err);
  }
}

async function createWorkout(req, res, next) {
  try {
    const data = workoutSchema.parse(req.body);

    const duplicate = data.days.reduce((acc, d) => {
      acc[d.weekday] = (acc[d.weekday] || 0) + 1;
      return acc;
    }, {});

    const conflictDays = Object.entries(duplicate)
      .filter(([, n]) => n > 1)
      .map(([weekday]) => Number(weekday));

    if (conflictDays.length) {
      return res.status(409).json({
        error: "Existem treinos no mesmo dia.",
        conflictWeekdays: conflictDays,
      });
    }

    const workout = await prisma.$transaction(async (tx) => {
      await tx.workout.updateMany({
        where: {
          studentId: data.studentId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return tx.workout.create({
        data: {
          studentId: data.studentId,
          title: data.title,
          days: {
            create: data.days.map((day) => ({
              weekday: day.weekday,
              title: day.title,
              exercises: {
                create: day.exercises,
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              exercises: true,
            },
          },
        },
      });
    });

    const student = await prisma.student.findUnique({
      where: {
        id: data.studentId,
      },
    });

    if (student) {
      await prisma.notification.create({
        data: {
          userId: student.userId,
          title: "🔥 Seu treino foi atualizado!",
          body: "Lucas fez alterações no seu treino.",
        },
      });
    }

    res.status(201).json(workout);
  } catch (err) {
    next(err);
  }
}

async function updateWorkout(req, res, next) {
  try {
    const data = workoutSchema.parse({
      ...req.body,
      studentId: req.body.studentId || req.params.studentId,
    });

    const current = await prisma.workout.findFirst({
      where: {
        id: req.params.id,
        studentId: data.studentId,
        isActive: true,
      },
    });

    if (!current) {
      return res.status(404).json({
        error: "Treino ativo não encontrado.",
      });
    }

    const duplicate = data.days.reduce((acc, d) => {
      acc[d.weekday] = (acc[d.weekday] || 0) + 1;
      return acc;
    }, {});

    const conflicts = Object.entries(duplicate)
      .filter(([, n]) => n > 1)
      .map(([weekday]) => Number(weekday));

    if (conflicts.length) {
      return res.status(409).json({
        error: `Conflito de dias: ${conflicts
          .map(
            (d) =>
              [
                "Domingo",
                "Segunda-feira",
                "Terça-feira",
                "Quarta-feira",
                "Quinta-feira",
                "Sexta-feira",
                "Sábado",
              ][d]
          )
          .join(", ")}.`,
        conflictWeekdays: conflicts,
      });
    }

    const workout = await prisma.$transaction(async (tx) => {
      await tx.workoutDay.deleteMany({
        where: {
          workoutId: current.id,
        },
      });

      return tx.workout.update({
        where: {
          id: current.id,
        },
        data: {
          title: data.title,
          days: {
            create: data.days.map((day) => ({
              weekday: day.weekday,
              title: day.title,
              exercises: {
                create: day.exercises,
              },
            })),
          },
        },
        include: {
          days: {
            include: {
              exercises: true,
            },
          },
        },
      });
    });

    res.json(workout);
  } catch (err) {
    next(err);
  }
}

async function createExercise(req, res, next) {
  try {
    const data = exerciseDataSchema.parse(req.body);

    const existing = await prisma.exercise.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
      include: {
        videos: true,
      },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const exercise = await prisma.exercise.create({
      data,
      include: {
        videos: true,
      },
    });

    res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
}

async function updateExercise(req, res, next) {
  try {
    res.json(
      await prisma.exercise.update({
        where: {
          id: req.params.id,
        },
        data: exerciseDataSchema.partial().parse(req.body),
        include: {
          videos: true,
        },
      })
    );
  } catch (err) {
    next(err);
  }
}

async function deleteExercise(req, res, next) {
  try {
    await prisma.exercise.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function listExercises(req, res, next) {
  try {
    res.json(
      await prisma.exercise.findMany({
        include: {
          videos: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      })
    );
  } catch (err) {
    next(err);
  }
}

async function addExerciseVideo(req, res, next) {
  try {
    const { exerciseId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        error: "Envie um vídeo.",
      });
    }

    const exercise = await prisma.exercise.findUnique({
      where: {
        id: exerciseId,
      },
    });

    if (!exercise) {
      return res.status(404).json({
        error: "Exercício não encontrado.",
      });
    }

    const publicBase = (
      process.env.PUBLIC_API_URL ||
      process.env.FRONTEND_URL ||
      ""
    ).replace(/\/$/, "");

    const url = `${publicBase}/uploads/videos/${req.file.filename}`;

    const video = await prisma.exerciseVideo.create({
      data: {
        exerciseId,
        url,
      },
    });

    res.status(201).json(video);
  } catch (e) {
    next(e);
  }
}

async function replaceExerciseVideo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Envie um vídeo.",
      });
    }

    const old = await prisma.exerciseVideo.findUnique({
      where: {
        id: req.params.videoId,
      },
    });

    if (!old || old.exerciseId !== req.params.exerciseId) {
      return res.status(404).json({
        error: "Vídeo não encontrado.",
      });
    }

    const oldPath = old.url.includes("/uploads/videos/")
      ? path.join(
          process.cwd(),
          "uploads",
          "videos",
          old.url.split("/uploads/videos/").pop()
        )
      : null;

    const publicBase = (
      process.env.PUBLIC_API_URL ||
      process.env.FRONTEND_URL ||
      ""
    ).replace(/\/$/, "");

    const url = `${publicBase}/uploads/videos/${req.file.filename}`;

    const updated = await prisma.exerciseVideo.update({
      where: {
        id: old.id,
      },
      data: {
        url,
      },
    });

    if (oldPath && fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    res.json(updated);
  } catch (e) {
    next(e);
  }
}

async function deleteExerciseVideo(req, res, next) {
  try {
    const video = await prisma.exerciseVideo.findUnique({
      where: {
        id: req.params.videoId,
      },
    });

    if (!video || video.exerciseId !== req.params.exerciseId) {
      return res.status(404).json({
        error: "Vídeo não encontrado.",
      });
    }

    const fileName = video.url.includes("/uploads/videos/")
      ? video.url.split("/uploads/videos/").pop()
      : null;

    await prisma.exerciseVideo.delete({
      where: {
        id: video.id,
      },
    });

    if (fileName) {
      const file = path.join(
        process.cwd(),
        "uploads",
        "videos",
        fileName
      );

      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  getActiveWorkout,
  registerLoad,
  getLoadHistory,
  createWorkout,
  updateWorkout,
  listExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  addExerciseVideo,
  replaceExerciseVideo,
  deleteExerciseVideo,
  completeExercise,
};