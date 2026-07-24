import { RoomRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomResponseDto {
  @ApiProperty({ example: 1 })
  roomId!: number;

  @ApiProperty({ enum: RoomRole, example: RoomRole.MEMBER })
  role!: RoomRole;

  @ApiProperty({ example: '2026-05-25T12:00:00.000Z' })
  joinedAt!: string;
}
