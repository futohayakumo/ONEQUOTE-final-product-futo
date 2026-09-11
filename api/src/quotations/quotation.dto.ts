import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  COMMODITY_ORDER,
  EQUIPMENT_ORDER,
  MAX_QUANTITY_PER_ROW,
  MAX_ROWS,
  PORT_ORDER,
  SCOPE_ORDER,
  TIER_ORDER,
} from "../../../src/lib/pricing.ts";
import { SCHEDULE_DAYS } from "../../../src/lib/sailings.ts";
import { MAX_EXTRA_FREE_TIME_DAYS } from "../../../src/lib/vas.ts";
import type {
  Commodity,
  EquipmentType,
  LoyaltyTier,
  PortCode,
  Scope,
} from "../../../src/types/quote.ts";

/**
 * The request, as the real form collects it — observed on ONE QUOTE on
 * 2026-09-11: origin, destination, container rows of equipment × quantity ×
 * weight, a commodity, and a departure day. Plus the two fields this
 * portfolio adds because it has no accounts: the loyalty tier, and the scope
 * at each end.
 *
 * Every allowed value comes from the pricing module's own tables, so this DTO
 * cannot drift from what the calculation accepts.
 */
export class ContainerRowDto {
  @ApiProperty({ enum: EQUIPMENT_ORDER, example: "DRY20" })
  @IsIn(EQUIPMENT_ORDER as readonly string[])
  equipment!: EquipmentType;

  @ApiProperty({ example: 3, minimum: 1, maximum: MAX_QUANTITY_PER_ROW })
  @IsInt()
  @Min(1)
  @Max(MAX_QUANTITY_PER_ROW)
  quantity!: number;

  @ApiProperty({ example: 36000, description: "Gross cargo weight across the row, kg" })
  @IsNumber()
  @Min(1)
  weightKg!: number;
}

export class VasDto {
  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  premiumCargo?: boolean;

  @ApiPropertyOptional({ default: 0, maximum: MAX_EXTRA_FREE_TIME_DAYS })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_EXTRA_FREE_TIME_DAYS)
  extraFreeTimeOrigin?: number;

  @ApiPropertyOptional({ default: 0, maximum: MAX_EXTRA_FREE_TIME_DAYS })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_EXTRA_FREE_TIME_DAYS)
  extraFreeTimeDestination?: number;
}

export class QuotationRequestDto {
  @ApiProperty({ enum: PORT_ORDER, example: "JPYOK", description: "Port of loading, UN/LOCODE" })
  @IsIn(PORT_ORDER as readonly string[])
  pol!: PortCode;

  @ApiProperty({ enum: PORT_ORDER, example: "SGSIN", description: "Port of discharge, UN/LOCODE" })
  @IsIn(PORT_ORDER as readonly string[])
  pod!: PortCode;

  @ApiProperty({ type: [ContainerRowDto], minItems: 1, maxItems: MAX_ROWS })
  @ValidateNested({ each: true })
  @Type(() => ContainerRowDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ROWS)
  containers!: ContainerRowDto[];

  @ApiProperty({ enum: COMMODITY_ORDER, example: "GENERAL" })
  @IsIn(COMMODITY_ORDER as readonly string[])
  commodity!: Commodity;

  @ApiProperty({ enum: TIER_ORDER, example: "SILVER_SAIL", description: "The customer's loyalty tier" })
  @IsIn(TIER_ORDER as readonly string[])
  tier!: LoyaltyTier;

  @ApiPropertyOptional({ enum: SCOPE_ORDER, default: "CY" })
  @IsOptional()
  @IsIn(SCOPE_ORDER as readonly string[])
  originScope?: Scope;

  @ApiPropertyOptional({ enum: SCOPE_ORDER, default: "CY" })
  @IsOptional()
  @IsIn(SCOPE_ORDER as readonly string[])
  destinationScope?: Scope;

  @ApiProperty({
    example: 0,
    minimum: 0,
    maximum: SCHEDULE_DAYS - 1,
    description: "Departure day, as days from the schedule's reference day (2026-09-18). Only days with a sailing are valid.",
  })
  @IsInt()
  @Min(0)
  @Max(SCHEDULE_DAYS - 1)
  etdOffset!: number;

  @ApiPropertyOptional({
    description: "Which of the returned options to price the ticket for. Defaults to the recommended one.",
    example: "JPYOK|SGSIN-direct-0",
  })
  @IsOptional()
  @IsString()
  sailingId?: string;

  @ApiPropertyOptional({ type: VasDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VasDto)
  vas?: VasDto;

  @ApiPropertyOptional({
    description: "Currencies to show the total in beside USD, priced at the fetched ECB rate.",
    example: ["JPY"],
    type: [String],
  })
  @IsOptional()
  @IsIn(["JPY", "EUR", "SGD"], { each: true })
  alsoIn?: string[];
}
