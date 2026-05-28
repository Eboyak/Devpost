import prisma from "../db.js";

async function main() {
  await seedContentPages();
  await seedGrimoireEntries();
  await seedProducts();
  await seedSocialLinks();
}

async function seedContentPages() {
  const pages = [
    {
      slug: "home",
      title: "Home",
      summary: "The main hub for My Digital Grimoire.",
      body: "A growing place for myths, rituals, astrology, prayers, symbols, and spiritual traditions.",
    },
    {
      slug: "teachings",
      title: "Teachings",
      summary: "Respectful educational overviews for future study pages.",
      body: "This area should stay careful, curious, and grounded in academic or primary sources.",
    },
    {
      slug: "store",
      title: "Store",
      summary: "Placeholder store and social media front.",
      body: "No checkout yet. This will later hold digital products, updates, and links.",
    },
  ];

  for (const page of pages) {
    await prisma.contentPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
}

async function seedGrimoireEntries() {
  const entries = [
    {
      slug: "herbs",
      title: "Herbs",
      category: "reference",
      summary: "Plant notes, folklore, safety reminders, and symbolism.",
    },
    {
      slug: "symbols",
      title: "Symbols",
      category: "reference",
      summary: "Signs, shapes, planets, elements, and sacred images.",
    },
    {
      slug: "rituals",
      title: "Rituals",
      category: "practice",
      summary: "Notes on ritual structure, intention, and practice.",
    },
    {
      slug: "astrology",
      title: "Astrology",
      category: "study",
      summary: "Signs, planets, houses, and chart vocabulary.",
    },
  ];

  for (const entry of entries) {
    await prisma.grimoireEntry.upsert({
      where: { slug: entry.slug },
      update: entry,
      create: entry,
    });
  }
}

async function seedProducts() {
  const products = [
    {
      slug: "digital-pages",
      name: "Digital Pages",
      description: "Printable grimoire pages, study sheets, and ritual notes.",
      status: "coming_soon",
    },
    {
      slug: "symbol-packs",
      name: "Symbol Packs",
      description: "Small collections of symbols, meanings, and reference cards.",
      status: "coming_soon",
    },
    {
      slug: "guided-journals",
      name: "Guided Journals",
      description: "Reflection prompts for myth, astrology, and personal practice.",
      status: "coming_soon",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
}

async function seedSocialLinks() {
  const links = [
    {
      label: "Instagram",
      url: null,
      note: "Placeholder for future Instagram link.",
      isLive: false,
    },
    {
      label: "TikTok",
      url: null,
      note: "Placeholder for future TikTok link.",
      isLive: false,
    },
    {
      label: "Shop Link",
      url: null,
      note: "Placeholder for future store platform link.",
      isLive: false,
    },
  ];

  for (const link of links) {
    await prisma.socialLink.upsert({
      where: { label: link.label },
      update: link,
      create: link,
    });
  }
}

main()
  .then(async function () {
    await prisma.$disconnect();
    console.log("Starter database content has been seeded.");
  })
  .catch(async function (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
