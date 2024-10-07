import { Controller, Get, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(readonly weatherService: WeatherService) {}
  @Get(':city')
  getAll(@Param('city') city: string) {
    return this.weatherService.getWeather(city);
  }
}
