import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service.ts";
import { RatesService } from "../rates/rates.service.ts";

/** What the service fetched, readable as-is, so a reader can check a figure's source. */
@ApiTags("reference")
@Controller("v1")
export class ReferenceController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RatesService) private readonly ecb: RatesService,
  ) {}

  @Get("rates")
  @ApiOperation({
    summary: "Today's ECB rates, fetched now; or the stored ones, labelled cached, when the ECB does not answer",
  })
  rates() {
    return this.ecb.current();
  }

  @Get("ports")
  @ApiOperation({ summary: "Seaports from UN/LOCODE in the routed countries" })
  @ApiQuery({ name: "country", required: false, example: "JP" })
  ports(@Query("country") country?: string) {
    return this.prisma.port.findMany({
      where: country ? { country: country.toUpperCase() } : undefined,
      orderBy: [{ country: "asc" }, { unlocode: "asc" }],
    });
  }
}
