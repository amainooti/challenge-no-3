import { Controller, Get, Param, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('weather')
export class WeatherController {
  constructor(readonly weatherService: WeatherService) {}
  @CacheTTL(30) // override TTL to 30 seconds
  @Get()
  getAll(@Query('city') city: string) {
    return this.weatherService.getWeather(city);
  }
}
