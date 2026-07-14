import { User } from '../../users/entities/user.entity';
export declare class UserGamification {
    id: string;
    xp: number;
    level: number;
    isPremium: boolean;
    activeTitle: string;
    avatarFrame: string;
    user: User;
}
