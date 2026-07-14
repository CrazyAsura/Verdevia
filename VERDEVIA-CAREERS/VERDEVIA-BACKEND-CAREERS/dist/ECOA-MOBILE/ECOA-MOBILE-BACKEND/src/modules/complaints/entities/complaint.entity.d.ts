import { User } from '../../users/entities/user.entity';
import { ComplaintStatus, PollutionType, ComplaintPrivacy } from '../enums/complaint.enums';
export declare class Complaint {
    id: string;
    type: PollutionType;
    description: string;
    location: string;
    imageUrl: string;
    status: ComplaintStatus;
    privacy: ComplaintPrivacy;
    latitude: number;
    longitude: number;
    ip: string;
    user: User;
    assignedContractor: User;
    createdAt: Date;
    updatedAt: Date;
}
