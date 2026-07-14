import { User } from '../../users/entities/user.entity';
import { UserGender, UserEthnicity } from '../../users/enums/user.enums';
export declare class UserProfile {
    id: string;
    realName: string;
    identity: string;
    gender: UserGender;
    ethnicity: UserEthnicity;
    birthDate: string;
    avatarUrl: string;
    bio: string;
    address: {
        zipCode?: string;
        street?: string;
        city?: string;
        state?: string;
        district?: string;
        country?: string;
        number?: string;
    };
    phones: {
        ddi?: string;
        ddd?: string;
        number?: string;
    }[];
    user: User;
}
