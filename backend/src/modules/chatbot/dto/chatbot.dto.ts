import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatbotMessageDto {
  @ApiProperty({ example: 'Giá vé xem phim Mai bao nhiêu?', description: 'Tin nhắn gửi tới CineCore AI Concierge' })
  @IsString()
  @IsNotEmpty({ message: 'Tin nhắn không được để trống' })
  message: string;
}

