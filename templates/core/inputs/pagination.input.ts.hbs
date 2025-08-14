import { InputType, Int, Field } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1, description: 'default: 1' })
  @Min(1)
  page = 1;

  @Field(() => Int, {
    defaultValue: 10,
    description: 'default: 10, minimum: 1, max: 100',
  })
  @Min(1)
  @Max(100)
  pageSize = 10;

  get skipValue(): number {
    return (this.page - 1) * this.pageSize;
  }
}
