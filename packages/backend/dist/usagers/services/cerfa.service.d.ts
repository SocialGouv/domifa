import { Model } from "mongoose";
import { Usager } from '../interfaces/usagers';
import { UsersService } from '../../users/users.service';
export declare class CerfaService {
    private readonly usagerModel;
    private readonly usersService;
    constructor(usagerModel: Model<Usager>, usersService: UsersService);
    attestation(usager: Usager): Promise<any>;
}
