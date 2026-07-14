import { Field, ID, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export enum CareersAdminRole { ADMIN = 'ADMIN', SUPER_ADMIN = 'SUPER_ADMIN' }
registerEnumType(CareersAdminRole, { name: 'CareersAdminRole' });

@InputType('LoginInput')
export class CareersLoginInput {
  @Field()
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}

@ObjectType()
export class CareersAdminProfile {
  @Field({ nullable: true }) realName?: string;
}

@ObjectType()
export class CareersAdminUser {
  @Field(() => ID) id: string;
  @Field() email: string;
  @Field(() => CareersAdminRole) role: CareersAdminRole;
  @Field(() => CareersAdminProfile, { nullable: true }) profile?: CareersAdminProfile;
}

@ObjectType()
export class CareersLoginResponse {
  @Field() token: string;
  @Field(() => CareersAdminUser) user: CareersAdminUser;
}
