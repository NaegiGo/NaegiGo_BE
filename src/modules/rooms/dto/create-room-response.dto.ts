import { AuthType, RoomRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'ABC123' })
  code!: string;

  @ApiProperty({ example: '아침 6시 기상' })
  name!: string;

  @ApiProperty({ example: '평일 아침 6시 기상 인증' })
  goal!: string;

  @ApiProperty({ example: '꼴찌가 모두에게 커피 한 잔씩' })
  penalty!: string;

  @ApiProperty({ enum: AuthType, example: AuthType.BUTTON })
  authType!: AuthType;

  @ApiProperty({ example: [1, 2, 3, 4, 5], type: [Number] })
  targetWeekdays!: number[];

  @ApiProperty({ example: '2026-05-27T00:00:00.000Z' })
  startDate!: string;

  @ApiProperty({ example: '2026-06-27T23:59:59.000Z' })
  endDate!: string;

  @ApiProperty({ enum: RoomRole, example: RoomRole.OWNER })
  myRole!: RoomRole;

  @ApiProperty({ example: 1 })
  memberCount!: number;
}
