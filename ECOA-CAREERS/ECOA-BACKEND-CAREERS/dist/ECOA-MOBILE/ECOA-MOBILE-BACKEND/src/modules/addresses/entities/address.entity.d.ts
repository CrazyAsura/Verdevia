import { User } from '../../users/entities/user.entity';
export declare class Address {
    id: string;
    zipCode: string;
    street: string;
    number: string;
    complement: string;
    district: string;
    city: string;
    state: string;
    country: string;
    user: User;
}
