import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateUserNameRequestDto {
  @ApiProperty({
    example: '희주',
    description: '2자 이상 10자 이하 이름',
  })
  @IsString()
  @Length(2, 10, {
    message: '이름은 2자 이상 10자 이하로 입력해주세요.',
  })
  name!: string;
}
