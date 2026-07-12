import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class MutationResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
