import { Module } from "@nestjs/common";
import { IngestController } from "./ingest.controller.ts";
import { IngestService } from "./ingest.service.ts";

@Module({ providers: [IngestService], controllers: [IngestController], exports: [IngestService] })
export class IngestModule {}
