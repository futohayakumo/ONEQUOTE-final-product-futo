import { Controller, Inject, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { IngestService } from "./ingest.service.ts";

@ApiTags("ingest")
@Controller("v1/ingest")
export class IngestController {
  constructor(@Inject(IngestService) private readonly ingest: IngestService) {}

  @Post("run")
  @ApiOperation({
    summary: "Fetch ECB rates and the UN/LOCODE port list now, instead of waiting for the schedule",
  })
  run() {
    return this.ingest.run();
  }
}
