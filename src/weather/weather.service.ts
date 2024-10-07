import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';

import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getWeather(city: string): Promise<any> {
    const cacheKey = `city-data:${city}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return cachedData;
    }

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
      const weatherData = weather.data;

      // Store the data in cache
      await this.cacheManager.set(cacheKey, weatherData);

      return weatherData;
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        if (error.response) {
          const axiosError = error as AxiosError;

          if (axiosError.code === 'ECONNABORTED') {
            throw new RequestTimeoutException(
              'The request took too long to complete.',
            );
          }
          const statusCode = error.response.status;
          const errorMsg = error.response.data?.message || error.message;
          if (statusCode === 404) {
            throw new NotFoundException('City not found.');
          } else if (statusCode === 400) {
            throw new BadRequestException(
              'Bad API Request:Invalid location parameter value',
            );
          } else {
            throw new InternalServerErrorException(
              `External service error: ${errorMsg}`,
            );
          }
        }
        throw new Error(error.message);
      }
    }
    throw new InternalServerErrorException('Something happened ');
  }
}
