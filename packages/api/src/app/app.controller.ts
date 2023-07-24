import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ContactService } from './contacts.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private contact: ContactService) {}

  @Get()
  getData() {
    return "Welcome to the Party AI API!"
  }


  @Get('contacts')
  async getContacts(){
    return await this.contact.getContacts();
  }

  @Get('themes')
  async getThemes(){
    return await this.appService.getThemes();
  }

  @Post('party-plans')
  async getPartyPlans(@Body('theme') theme: string, @Body('guests') guests: {name: string, email: string}[]){
    return await this.appService.generatePartyPlans(theme, guests);
  }

  @Post('send-invites')
  async getInvites(@Body('plans') plans: string, @Body('dateTime') dateTime: string, @Body('guests') guests: {name: string, email: string}[]){
    return await this.appService.sendInvitations(plans, dateTime, guests);
  }

  // @Get('seed')
  // async seed(){
  //   return await this.contact.seed();
  // }
}
