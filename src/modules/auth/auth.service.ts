import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SocialProvider, User } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code';
import { KakaoLoginResponseDto } from './dto/kakao-login-response.dto';
import { KakaoService } from './kakao.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async loginWithKakao(kakaoAccessToken: string): Promise<KakaoLoginResponseDto> {
    const jwtSecret = process.env.JWT_SECRET;
    const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '1h';
    const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '14d';

    if (!jwtSecret) {
      throw new AppException(ErrorCode.JWT_SECRET_NOT_CONFIGURED);
    }

    const kakaoUser = await this.kakaoService.getUserProfile(kakaoAccessToken);
    const linkedAccount = await this.usersService.findBySocialAccount(
      SocialProvider.KAKAO,
      kakaoUser.id,
    );

    const isNewUser = !linkedAccount;
    const user =
      linkedAccount?.user ??
      (await this.usersService.createWithSocialAccount({
        provider: SocialProvider.KAKAO,
        providerId: kakaoUser.id,
        name: this.truncateName(kakaoUser.nickname),
        profileImageUrl: kakaoUser.profileImageUrl,
      }));

    const payload = {
      sub: user.id.toString(),
      provider: SocialProvider.KAKAO,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: accessTokenExpiresIn as never,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: refreshTokenExpiresIn as never,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      isNewUser,
      user: this.toUserDto(user),
    };
  }

  private toUserDto(user: User) {
    return {
      id: Number(user.id),
      name: user.name,
      profileImageUrl: user.profileImageUrl,
      avatarTint: user.avatarTint,
    };
  }

  private truncateName(name: string) {
    return name.slice(0, 10);
  }
}
