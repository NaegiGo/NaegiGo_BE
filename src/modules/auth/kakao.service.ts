import { Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/exceptions/error-code';

type KakaoTokenResponse = {
  access_token?: string;
};

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
  getAuthorizationUrl() {
    const clientId = process.env.KAKAO_REST_API_KEY;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new AppException(ErrorCode.KAKAO_CONFIG_NOT_FOUND);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const clientId = process.env.KAKAO_REST_API_KEY;
    const redirectUri = process.env.KAKAO_REDIRECT_URI;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;

    if (!clientId || !redirectUri) {
      throw new AppException(ErrorCode.KAKAO_CONFIG_NOT_FOUND);
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
    });

    if (clientSecret) {
      body.append('client_secret', clientSecret);
    }

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body,
    });

    if (!response.ok) {
      throw new AppException(ErrorCode.KAKAO_TOKEN_EXCHANGE_FAILED);
    }

    const data = (await response.json()) as KakaoTokenResponse;
    if (!data.access_token) {
      throw new AppException(ErrorCode.KAKAO_TOKEN_EXCHANGE_FAILED);
    }

    return data.access_token;
  }

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
