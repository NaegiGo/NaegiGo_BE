import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/responses/api.response';
import { SuccessCode } from '../../common/responses/success-code';
import { AuthService } from './auth.service';
import { KakaoLoginRequestDto } from './dto/kakao-login-request.dto';
import { KakaoLoginResponseDto } from './dto/kakao-login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 Access Token으로 로그인하거나 회원가입합니다.',
  })
  @ApiBody({ type: KakaoLoginRequestDto })
  @ApiOkResponse({ type: KakaoLoginResponseDto })
  async kakaoLogin(@Body() body: KakaoLoginRequestDto) {
    const data = await this.authService.loginWithKakao(body.kakaoAccessToken);
    return ApiResponse.success(SuccessCode.KAKAO_LOGIN_SUCCESS, data);
  }
}
