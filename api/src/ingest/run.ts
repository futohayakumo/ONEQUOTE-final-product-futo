/** `pnpm ingest` — run one ingest from the command line and print the report. */
import "reflect-metadata";
import { PrismaService } from "../prisma/prisma.service.ts";
import { IngestService } from "./ingest.service.ts";

const prisma = new PrismaService();
await prisma.$connect();
const report = await new IngestService(prisma).run();
console.log(JSON.stringify(report, null, 2));
await prisma.$disconnect();
