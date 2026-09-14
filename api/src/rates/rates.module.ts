import { Module } from "@nestjs/common";
import { RatesService } from "./rates.service.ts";

@Module({ providers: [RatesService], exports: [RatesService] })
export class RatesModule {}
