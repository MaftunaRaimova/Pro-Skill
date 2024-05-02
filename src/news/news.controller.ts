import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NewsService, NewsServiceAdmin } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { ApiTags, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guad';

import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('News', 'Admin')
@Controller('news')
export class NewsControllerAdmin {
  constructor(private readonly newsServiceAdmin: NewsServiceAdmin) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        mainUrl: { type: 'string' },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  addNews(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateNewsDto,
  ) {
    return this.newsServiceAdmin.addNews(file, body);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        id: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        mainUrl: { type: 'string' },
      },
    },
  })
  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  update(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateNewsDto,
  ) {
    return this.newsServiceAdmin.update(file, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsServiceAdmin.remove(+id);
  }
}

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}
  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }
}
