import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Redirect,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../common/responses/api.response';
import { SuccessCode } from '../../common/responses/success-code';
import { AuthService } from './auth.service';
import { KakaoLoginResponseDto } from './dto/kakao-login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('kakao')
  @Redirect()
  @ApiOperation({
    summary: '카카오 로그인 페이지로 이동',
    description: '카카오 로그인 페이지로 리다이렉트합니다.',
  })
  redirectToKakaoLogin() {
    return {
      url: this.authService.getKakaoLoginUrl(),
    };
  }

  @Get('kakao/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 인가 코드로 로그인하거나 회원가입합니다.',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: '카카오에서 전달한 인가 코드',
  })
  @ApiOkResponse({ type: KakaoLoginResponseDto })
  async kakaoLogin(@Query('code') code: string) {
    const data = await this.authService.loginWithKakaoCode(code);
    return ApiResponse.success(SuccessCode.KAKAO_LOGIN_SUCCESS, data);
  }
}
