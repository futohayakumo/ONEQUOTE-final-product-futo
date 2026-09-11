import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { CONTAINER_ORDER, MAX_CBM, PORT_ORDER, TIER_ORDER } from "../../../src/lib/pricing.ts";
import { INCOTERM_ORDER, type Incoterm } from "../../../src/lib/charges.ts";
import type { ContainerType, LoyaltyTier, PortCode } from "../../../src/types/quote.ts";

/**
 * The five inputs, and the two the invoice needs on top.
 *
 * The allowed values come from the pricing module's own tables, so this DTO
 * cannot drift from what the calculation accepts: add a port there and it
 * is accepted here, with no second list to forget.
 */
export class QuotationRequestDto {
  @ApiProperty({ enum: PORT_ORDER, example: "JPYOK", description: "Port of loading, UN/LOCODE" })
  @IsIn(PORT_ORDER as readonly string[])
  pol!: PortCode;

  @ApiProperty({ enum: PORT_ORDER, example: "SGSIN", description: "Port of discharge, UN/LOCODE" })
  @IsIn(PORT_ORDER as readonly string[])
  pod!: PortCode;

  @ApiProperty({ example: 90, minimum: 1, maximum: MAX_CBM, description: "Cargo volume in cubic metres" })
  @IsNumber()
  @Min(1)
  @Max(MAX_CBM)
  cbm!: number;

  @ApiProperty({ enum: CONTAINER_ORDER, example: "20GP" })
  @IsIn(CONTAINER_ORDER as readonly string[])
  containerType!: ContainerType;

  @ApiProperty({ enum: TIER_ORDER, example: "SILVER_SAIL", description: "The customer's loyalty tier" })
  @IsIn(TIER_ORDER as readonly string[])
  tier!: LoyaltyTier;

  @ApiPropertyOptional({ enum: INCOTERM_ORDER, default: "FOB" })
  @IsOptional()
  @IsIn(INCOTERM_ORDER as readonly string[])
  incoterm?: Incoterm;

  @ApiPropertyOptional({
    description: "Which of the returned sailings to price the ticket for. Defaults to the recommended one.",
    example: "OL133",
  })
  @IsOptional()
  @IsString()
  sailingId?: string;

  @ApiPropertyOptional({
    description: "Currencies to show the total in beside USD, priced at the fetched ECB rate.",
    example: ["JPY"],
    type: [String],
  })
  @IsOptional()
  @IsIn(["JPY", "EUR", "SGD"], { each: true })
  alsoIn?: string[];

  @ApiPropertyOptional({ description: "Reserved: pin a request to a lane index for replay", example: 0 })
  @IsOptional()
  @IsInt()
  lane?: number;
}
