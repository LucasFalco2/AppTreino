
ALTER TABLE "Student" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Student" ADD COLUMN "objective" TEXT;
ALTER TABLE "Student" ADD COLUMN "routine" TEXT;
ALTER TABLE "Student" ADD COLUMN "nutritionNotes" TEXT;
ALTER TABLE "Student" ADD COLUMN "currentWeightKg" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "bodyFatPercent" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "muscleMassKg" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "waterPercent" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "caloriesTarget" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "proteinTarget" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "carbsTarget" DOUBLE PRECISION;
ALTER TABLE "Student" ADD COLUMN "fatTarget" DOUBLE PRECISION;

ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldTriceps" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldBiceps" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldSubscapular" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldSuprailiac" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldAbdominal" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldThigh" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldChest" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "skinfoldAxillaryMidline" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "bodyFatPercent" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "muscleMassKg" DOUBLE PRECISION;
ALTER TABLE "ProgressRecord" ADD COLUMN "waterPercent" DOUBLE PRECISION;

ALTER TABLE "Subscription" ADD COLUMN "reminderSentAt" TIMESTAMP(3);
ALTER TABLE "Feedback" ADD COLUMN "response" TEXT;
ALTER TABLE "Feedback" ADD COLUMN "respondedAt" TIMESTAMP(3);

CREATE TABLE "WorkoutAttendance" (
 "id" TEXT NOT NULL,
 "studentId" TEXT NOT NULL,
 "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "WorkoutAttendance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WorkoutAttendance_student_attendance_date_key" ON "WorkoutAttendance"("studentId","date");
ALTER TABLE "WorkoutAttendance" ADD CONSTRAINT "WorkoutAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Payment" (
 "id" TEXT NOT NULL,
 "name" TEXT NOT NULL,
 "email" TEXT NOT NULL,
 "phone" TEXT NOT NULL,
 "passwordHash" TEXT NOT NULL,
 "planId" TEXT NOT NULL,
 "couponId" TEXT,
 "amountCents" INTEGER NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'PENDING',
 "pixPayload" TEXT,
 "expiresAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "approvedAt" TIMESTAMP(3),
 "approvedByUserId" TEXT,
 CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "Message" (
 "id" TEXT NOT NULL,
 "studentId" TEXT NOT NULL,
 "senderUserId" TEXT NOT NULL,
 "receiverUserId" TEXT NOT NULL,
 "body" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "readAt" TIMESTAMP(3),
 CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "Message" ADD CONSTRAINT "Message_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverUserId_fkey" FOREIGN KEY ("receiverUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
