import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: '희주',
    nullable: true,
  })
  name!: string | null;

  @ApiProperty({
    example: 'https://...',
    nullable: true,
  })
  profileImageUrl!: string | null;

  @ApiProperty({
    example: 0,
    description: '0~4',
  })
  avatarTint!: number;
}