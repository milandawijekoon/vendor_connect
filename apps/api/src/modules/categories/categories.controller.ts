import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

const CATEGORY_EXAMPLE = { id: 'clxxxxxxx', name: 'Photography', slug: 'photography', vendorCount: 12 };

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List all categories',
    description: 'Returns all vendor service categories in alphabetical order, each with its count of approved vendors.',
  })
  @ApiOkResponse({ schema: { example: [CATEGORY_EXAMPLE] } })
  findAll() {
    return this.categoriesService.findAll();
  }
}
