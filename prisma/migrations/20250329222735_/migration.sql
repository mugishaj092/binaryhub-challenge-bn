/*
  Warnings:

  - The values [SECRETARY] on the enum `RoleData` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoleData_new" AS ENUM ('ADMIN');
ALTER TABLE "Role" ALTER COLUMN "name" DROP DEFAULT;
ALTER TABLE "Role" ALTER COLUMN "name" TYPE "RoleData_new" USING ("name"::text::"RoleData_new");
ALTER TYPE "RoleData" RENAME TO "RoleData_old";
ALTER TYPE "RoleData_new" RENAME TO "RoleData";
DROP TYPE "RoleData_old";
ALTER TABLE "Role" ALTER COLUMN "name" SET DEFAULT 'ADMIN';
COMMIT;

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "name" SET DEFAULT 'ADMIN';
