import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    readonly config: ConfigService,
  ) {}

  async getWeather(city: string) {
    try {
      const weather = await firstValueFrom(
        this.httpService.get(
          `/timeline/${city}?key=${this.config.get<string>('API_KEY')}`,
        ),
      );
      if (!weather)
        throw new NotFoundException(
          'Weather details could not be found we are working on it.',
        );

      return weather.data;
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        throw new Error(error.message);
      }
    }
    throw new InternalServerErrorException('Something happened ');
  }
}
