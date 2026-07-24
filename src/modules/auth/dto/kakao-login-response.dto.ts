import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class KakaoLoginResponseDto {
  @ApiProperty({
    example: 'jwt_access_token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'jwt_refresh_token',
  })
  refreshToken!: string;

  @ApiProperty({
    example: true,
    description: '신규 회원 여부',
  })
  isNewUser!: boolean;

  @ApiProperty({
    type: UserDto,
  })
  user!: UserDto;
}