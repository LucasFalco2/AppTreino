CREATE TABLE "WorkoutExerciseCompletion" (
  "id" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "workoutExerciseId" TEXT NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkoutExerciseCompletion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WorkoutExerciseCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WorkoutExerciseCompletion_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "student_workout_exercise_completion" ON "WorkoutExerciseCompletion"("studentId", "workoutExerciseId");
CREATE INDEX "WorkoutExerciseCompletion_studentId_idx" ON "WorkoutExerciseCompletion"("studentId");
