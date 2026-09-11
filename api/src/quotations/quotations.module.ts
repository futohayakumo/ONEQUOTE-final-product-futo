import { Module } from "@nestjs/common";
import { QuotationsController } from "./quotations.controller.ts";
import { QuotationsService } from "./quotations.service.ts";

@Module({ providers: [QuotationsService], controllers: [QuotationsController] })
export class QuotationsModule {}
