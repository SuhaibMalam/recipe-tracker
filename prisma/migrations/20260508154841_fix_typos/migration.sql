/*
  Warnings:

  - You are about to drop the column `protien` on the `NutritionLog` table. All the data in the column will be lost.
  - You are about to drop the column `imageurl` on the `Recipe` table. All the data in the column will be lost.
  - You are about to drop the column `protien` on the `Recipe` table. All the data in the column will be lost.
  - Added the required column `protein` to the `NutritionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "NutritionLog" DROP COLUMN "protien",
ADD COLUMN     "protein" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "imageurl",
DROP COLUMN "protien",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "protein" DOUBLE PRECISION;
