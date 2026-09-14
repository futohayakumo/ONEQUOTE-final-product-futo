import { Module } from "@nestjs/common";
import { IngestController } from "./ingest.controller.ts";
import { RatesModule } from "../rates/rates.module.ts";
import { IngestService } from "./ingest.service.ts";

@Module({ imports: [RatesModule], providers: [IngestService], controllers: [IngestController], exports: [IngestService] })
export class IngestModule {}
