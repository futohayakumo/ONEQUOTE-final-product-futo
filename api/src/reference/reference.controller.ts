import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service.ts";

/** What the service fetched, readable as-is, so a reader can check a figure's source. */
@ApiTags("reference")
@Controller("v1")
export class ReferenceController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("rates")
  @ApiOperation({ summary: "The exchange rates currently in use, with source, date and fetch time" })
  rates() {
    return this.prisma.rate.findMany({ orderBy: { key: "asc" } });
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
