import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = [
    { name: "김다이어트", totalDemerits: 0 },
    { name: "이운동", totalDemerits: 2 },
    { name: "박치킨", totalDemerits: 5 },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { name: user.name },
      update: {},
      create: {
        name: user.name,
        totalDemerits: user.totalDemerits,
      },
    });
  }

  console.log("초기 사용자 데이터 생성 완료!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
