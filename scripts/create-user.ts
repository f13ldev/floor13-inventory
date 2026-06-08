import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error("Usage: pnpm create-user <email> <password>");
  process.exit(1);
}

async function main() {
  const hashed = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { email },
    update: { password: hashed },
    create: { email, password: hashed },
  });
  console.log(`✓ User ${email} created (or password updated).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
