import { AuthType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomRequestDto {
  @ApiProperty({
    example: '아침 6시 기상',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name!: string;

  @ApiProperty({
    example: '평일 아침 6시 기상 인증',
  })
  @IsString()
  @IsNotEmpty()
  goal!: string;

  @ApiProperty({
    example: '꼴찌가 모두에게 커피 한 잔씩',
  })
  @IsString()
  @IsNotEmpty()
  penalty!: string;

  @ApiProperty({
    enum: AuthType,
    example: AuthType.BUTTON,
  })
  @IsEnum(AuthType)
  authType!: AuthType;

  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  targetWeekdays!: number[];

  @ApiProperty({
    example: '2026-05-27T00:00:00',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    example: '2026-06-27T23:59:59',
  })
  @IsDateString()
  endDate!: string;
}
