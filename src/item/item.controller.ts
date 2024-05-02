import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { ItemService, ItemServiceAdmin } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { ApiBody, ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdateItemDto } from './dto/update-item.dto';
import { AdminGuard } from 'src/admin/admin.guad';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Item', 'Admin')
@Controller('item')
export class ItemControllerAdmin {
  constructor(private readonly itemServiceAdmin: ItemServiceAdmin) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Array of files to upload',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        author: { type: 'string' },
        price: { type: 'number' },
        libraryId: { type: 'number' },
        length: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 2))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateItemDto,
  ) {
    return this.itemServiceAdmin.createItem(files, body);
  }

  @Patch()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Array of files to upload',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        id: { type: 'number' },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        author: { type: 'string' },
        price: { type: 'number' },
        libraryId: { type: 'number' },
        length: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 2))
  async update(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateItemDto,
  ) {
    return this.itemServiceAdmin.update(files, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemServiceAdmin.remove(+id);
  }
}

@ApiTags('Item')
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  findAll() {
    return this.itemService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }
}
