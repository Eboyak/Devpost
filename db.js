import { PrismaClient } from "@prisma/client";

// Prisma is the database helper for this project.
// It lets the Express server talk to MySQL/MariaDB using clear JavaScript.
const prisma = new PrismaClient();

export default prisma;
