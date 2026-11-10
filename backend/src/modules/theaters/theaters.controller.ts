import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TheatersService } from './theaters.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Theaters')
@Controller('theaters')
export class TheatersController {
  constructor(private readonly theatersService: TheatersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các cụm rạp chiếu' })
  async findAll() {
    return this.theatersService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết cụm rạp và các phòng chiếu' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.theatersService.findById(id);
  }
}

