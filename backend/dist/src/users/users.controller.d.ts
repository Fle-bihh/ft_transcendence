import { UserCredentialsDto } from './dto/user-credentials.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    signUp(usersCredentialsDto: UserCredentialsDto): Promise<void>;
}
