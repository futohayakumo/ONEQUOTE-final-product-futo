import { Controller, Get, Inject } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service.ts";

@ApiTags("health")
@Controller("v1/health")
export class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Is the service up, and is its database reachable" })
  async health() {
    const rates = await this.prisma.rate.count();
    const ports = await this.prisma.port.count();
    return { ok: true, rates, ports };
  }
}
