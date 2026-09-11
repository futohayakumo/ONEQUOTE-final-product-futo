import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { QuotationRequestDto } from "./quotation.dto.ts";
import { QuotationsService } from "./quotations.service.ts";

@ApiTags("quotations")
@Controller("v1/quotations")
export class QuotationsController {
  constructor(@Inject(QuotationsService) private readonly quotations: QuotationsService) {}

  @Post()
  @ApiOperation({
    summary: "Price a shipment",
    description:
      "The options from the chosen departure priced all-in, the accepted option's ticket by section with value-added services, cut-offs and the timeline, the document a partner receives, and — if asked — the total in another currency at the ECB rate the service last fetched, with that rate's date.",
  })
  create(@Body() body: QuotationRequestDto) {
    return this.quotations.quote(body);
  }

  @Get(":reference")
  @ApiOperation({ summary: "Replay a quotation exactly as it was issued" })
  @ApiParam({ name: "reference", example: "QTN-E2C436" })
  byReference(@Param("reference") reference: string) {
    return this.quotations.byReference(reference);
  }
}
