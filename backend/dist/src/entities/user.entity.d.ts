export declare class User {
    id: string;
    username: string;
    password?: string | null;
    firstName: string;
    lastName: string;
    nickName?: string | null;
    profileImage?: string | null;
    email: string;
    isLogged: string;
    isAdmin: boolean;
    GoalTaken: number;
    GoalSet: number;
    NormalGameNumber: number;
    RankedGameNumber: number;
    NormalWinNumber: number;
    RankedWinNumber: number;
    PP: number;
    twoFactorAuth: boolean;
    Security: boolean;
    Friend: number;
    Climber: boolean;
    Hater: number;
}
