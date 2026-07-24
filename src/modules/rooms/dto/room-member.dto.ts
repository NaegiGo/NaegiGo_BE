import { ApiProperty } from '@nestjs/swagger';
import { RoomRole } from '@prisma/client';

export class RoomMemberDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '미니' })
  name!: string;

  @ApiProperty({ example: 0 })
  avatarTint!: number;

  @ApiProperty({ enum: RoomRole, example: RoomRole.OWNER })
  role!: RoomRole;

  @ApiProperty({ example: true })
  isMe!: boolean;
}
