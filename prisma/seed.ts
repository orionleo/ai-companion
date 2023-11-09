import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Musicians" },
    { name: "Famous People" },
    { name: "Animals" },
    { name: "Philosphy" },
    { name: "Scientists" },
    { name: "Games" },
    { name: "Movies & TV" },
  ];
  for (const category of categories) {
    const newNiche = await prisma.category.create({
      data: { name: category.name },
    });
    console.log(`Created niche: ${newNiche.name}`);
  }
}
main()
  .then(() => {
    console.log("done");
    prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
