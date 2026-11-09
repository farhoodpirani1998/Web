import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SubscribeNewsletterDto } from '../../content/newsletter/dto/subscribe-newsletter.dto';
import { NewsletterService } from '../../content/newsletter/newsletter.service';
import { PUBLIC_FORM_THROTTLE } from '../common/public-rate-limit.constants';

const GENERIC_SUBSCRIPTION_RESPONSE = {
  message: 'در صورت معتبر بودن ایمیل، عضویت شما ثبت شده است.',
};

@Throttle(PUBLIC_FORM_THROTTLE)
@Controller('public/newsletter/subscribe')
export class PublicNewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async subscribe(
    @Body() dto: SubscribeNewsletterDto,
  ): Promise<{ message: string }> {
    await this.newsletter.subscribe(dto.email);
    return GENERIC_SUBSCRIPTION_RESPONSE;
  }
}
