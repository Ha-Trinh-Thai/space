import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@space.io' },
    update: {},
    create: {
      email: 'admin@space.io',
      name: 'Admin',
      password: hashedPassword,
    },
  });

  console.log('Admin account created:', admin.email);

  // Create a default workspace for the admin
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'my-workspace' },
    update: {},
    create: {
      name: 'My Workspace',
      slug: 'my-workspace',
      members: {
        create: {
          userId: admin.id,
          role: 'OWNER',
        },
      },
    },
  });

  console.log('Default workspace created:', workspace.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
