import { Complaint } from '../../complaints/entities/complaint.entity';
import { UserRole } from '../enums/user.enums';
import { UserProfile } from '../../profiles/entities/user-profile.entity';
import { UserGamification } from '../../gamification/entities/user-gamification.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Phone } from '../../phones/entities/phone.entity';
export declare class User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    profile: UserProfile;
    gamification: UserGamification;
    address: Address;
    phones: Phone[];
    complaints: Complaint[];
    subscription: any;
    parentUserId: string | null;
    parentUser: User | null;
    subordinates: User[];
    createdAt: Date;
    updatedAt: Date;
}
