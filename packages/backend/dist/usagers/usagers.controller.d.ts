import { RdvDto } from './dto/rdv';
import { UsagersDto } from './dto/usagers.dto';
import { Decision } from './interfaces/decision';
import { CerfaService } from './services/cerfa.service';
import { UsagersService } from './services/usagers.service';
export declare class UsagersController {
    private readonly usagersService;
    private readonly cerfaService;
    constructor(usagersService: UsagersService, cerfaService: CerfaService);
    postUsager(usagerDto: UsagersDto): Promise<import("./interfaces/usagers").Usager>;
    patchUsager(usagerDto: UsagersDto): Promise<import("./interfaces/usagers").Usager>;
    postRdv(usagerId: number, rdvDto: RdvDto): Promise<import("./interfaces/usagers").Usager>;
    setDecision(usagerId: number, decision: Decision): Promise<import("./interfaces/usagers").Usager>;
    search(): Promise<import("./interfaces/usagers").Usager[]>;
    findOne(usagerId: number): Promise<import("./interfaces/usagers").Usager>;
    getAttestation(usagerId: number, res: any): Promise<void>;
    deleteDocument(usagerId: number, index: number): Promise<import("./interfaces/usagers").Usager>;
    getDocument(usagerId: number, index: number, res: any): Promise<void>;
    uploadDoc(usagerId: any, file: any, postData: any): Promise<import("./interfaces/usagers").Usager>;
}
