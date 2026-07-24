import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code';

type KakaoUserResponse = {
  id: number;
  properties?: {
    nickname?: string;
    profile_image?: string;
  };
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
};

export type KakaoUserProfile = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
};

@Injectable()
export class KakaoService {
  async getUserProfile(accessToken: string): Promise<KakaoUserProfile> {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!response.ok) {
      throw new AppException(ErrorCode.INVALID_KAKAO_ACCESS_TOKEN);
    }

    const data = (await response.json()) as KakaoUserResponse;
    const nickname =
      data.kakao_account?.profile?.nickname ??
      data.properties?.nickname ??
      '히죽이';

    const profileImageUrl =
      data.kakao_account?.profile?.profile_image_url ??
      data.properties?.profile_image ??
      null;

    return {
      id: String(data.id),
      nickname,
      profileImageUrl,
    };
  }
}