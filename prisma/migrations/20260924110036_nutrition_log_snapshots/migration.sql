/*
  Warnings:

  - You are about to drop the column `date` on the `NutritionLog` table. All the data in the column will be lost.
  - Added the required column `day` to the `NutritionLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `NutritionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NutritionLog" DROP COLUMN "date",
ADD COLUMN     "day" DATE NOT NULL,
ADD COLUMN     "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "servings" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "NutritionLog_userId_day_idx" ON "NutritionLog"("userId", "day");

-- CreateIndex
CREATE INDEX "NutritionLog_recipeId_idx" ON "NutritionLog"("recipeId");
