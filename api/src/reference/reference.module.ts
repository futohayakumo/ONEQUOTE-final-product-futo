import { Module } from "@nestjs/common";
import { ReferenceController } from "./reference.controller.ts";

@Module({ controllers: [ReferenceController] })
export class ReferenceModule {}
