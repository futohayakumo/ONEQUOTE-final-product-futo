import { Module } from "@nestjs/common";
import { RatesModule } from "../rates/rates.module.ts";
import { ReferenceController } from "./reference.controller.ts";

@Module({ imports: [RatesModule], controllers: [ReferenceController] })
export class ReferenceModule {}
