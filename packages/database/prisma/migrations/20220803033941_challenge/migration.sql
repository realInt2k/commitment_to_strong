-- CreateTable
CREATE TABLE "ChallengeMode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "start" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end" DATETIME NOT NULL,
    "moneyStaked" REAL NOT NULL,
    "challengeModeId" INTEGER NOT NULL,
    CONSTRAINT "Challenge_challengeModeId_fkey" FOREIGN KEY ("challengeModeId") REFERENCES "ChallengeMode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
