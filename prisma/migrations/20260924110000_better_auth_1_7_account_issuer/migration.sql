-- better-auth 1.7 keys accounts by (issuer, accountId). Existing rows are all
-- email/password, which better-auth labels "local:<providerId>"
-- (createLocalAccountIssuer in @better-auth/core).
ALTER TABLE "Account" ADD COLUMN "issuer" TEXT;
UPDATE "Account" SET "issuer" = 'local:' || "providerId" WHERE "issuer" IS NULL;
ALTER TABLE "Account" ALTER COLUMN "issuer" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_issuer_accountId_key" ON "Account"("issuer", "accountId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");
