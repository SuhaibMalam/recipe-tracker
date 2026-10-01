-- better-auth 1.7.6 dropped the Account.issuer field that 1.7.0 introduced
-- (see 20260924110000_better_auth_1_7_account_issuer). With it still NOT NULL,
-- every sign-up would fail because the adapter no longer supplies a value.
DROP INDEX "Account_issuer_accountId_key";
ALTER TABLE "Account" DROP COLUMN "issuer";
