import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateAdminDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsIn(['admin', 'super_admin']) role!: 'admin' | 'super_admin';
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateAdminDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(8) password?: string;
  @IsOptional() @IsIn(['admin', 'super_admin']) role?: 'admin' | 'super_admin';
  @IsOptional() @IsBoolean() active?: boolean;
}
export class SetDocumentPermissionDto {
  @IsString() documentId!: string;
  @IsString() filename!: string;
  @IsIn(['admin', 'super_admin']) minimumRole!: 'admin' | 'super_admin';
  @IsBoolean() explanationAllowed!: boolean;
  @IsOptional() @IsString() blockReason?: string;
}
