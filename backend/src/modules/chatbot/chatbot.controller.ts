import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChatbotService } from './chatbot.service';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Public()
  @Post('message')
  @ApiOperation({ summary: 'Trò chuyện với AI Concierge (hỗ trợ gợi ý phim và suất chiếu)' })
  async sendMessage(
    @Body('message') message: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.chatbotService.processMessage(message || '', user?.id);
  }
}

