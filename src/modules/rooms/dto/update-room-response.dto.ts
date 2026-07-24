import { AuthType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '아침 6시 기상' })
  name!: string;

  @ApiProperty({ example: '평일 아침 6시 기상 인증' })
  goal!: string;

  @ApiProperty({ example: '꼴찌가 모두에게 커피 한 잔씩' })
  penalty!: string;

  @ApiProperty({ enum: AuthType, example: AuthType.BUTTON })
  currentAuthType!: AuthType;

  @ApiProperty({ enum: AuthType, nullable: true, example: AuthType.PHOTO })
  pendingAuthType!: AuthType | null;

  @ApiProperty({ example: '2026-05-28', nullable: true })
  effectiveDate!: string | null;
}
