import { Module } from "@nestjs/common";
import { RatesModule } from "../rates/rates.module.ts";
import { QuotationsController } from "./quotations.controller.ts";
import { QuotationsService } from "./quotations.service.ts";

@Module({ imports: [RatesModule], providers: [QuotationsService], controllers: [QuotationsController] })
export class QuotationsModule {}
