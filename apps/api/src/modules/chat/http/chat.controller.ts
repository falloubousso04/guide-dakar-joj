import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { chatRequestSchema, type ChatResponse, chatResponseSchema } from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { AnswerChatMessage } from '../application/use-cases/answer-chat-message';

class ChatRequestDto extends createZodDto(chatRequestSchema) {}
class ChatResponseDto extends createZodDto(chatResponseSchema) {}

/** Couche fine : valider la conversation, appeler le cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly answerChatMessage: AnswerChatMessage) {}

  // 200 et non 201 : répondre à un message ne crée aucune ressource.
  @Post()
  @HttpCode(200)
  @ZodSerializerDto(ChatResponseDto)
  answer(@Body() body: ChatRequestDto): Promise<ChatResponse> {
    return this.answerChatMessage.execute(body.messages);
  }
}
