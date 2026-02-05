import type { Author } from './deal';

export interface UserProfile extends Author {
    email: string;
    bio: string;
    joinDate: Date;
    reputation: number;
    dealsPosted: number;
    location?: string;
}
