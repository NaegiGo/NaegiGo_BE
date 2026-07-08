import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KakaoLoginRequestDto {
  @ApiProperty({
    example: 'kakao_access_token',
    description: '카카오 Access Token',
  })
  @IsString()
  @IsNotEmpty()
  kakaoAccessToken!: string;
}