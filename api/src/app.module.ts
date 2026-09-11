import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { HealthController } from "./health.controller.ts";
import { IngestModule } from "./ingest/ingest.module.ts";
import { PrismaModule } from "./prisma/prisma.module.ts";
import { QuotationsModule } from "./quotations/quotations.module.ts";
import { ReferenceModule } from "./reference/reference.module.ts";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    IngestModule,
    ReferenceModule,
    QuotationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
