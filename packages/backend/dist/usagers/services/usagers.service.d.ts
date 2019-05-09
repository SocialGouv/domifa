import { Model } from "mongoose";
import { RdvDto } from '../dto/rdv';
import { UsagersDto } from '../dto/usagers.dto';
import { Decision } from '../interfaces/decision';
import { Usager } from '../interfaces/usagers';
export declare class UsagersService {
    private readonly usagerModel;
    limit: number;
    sort: {};
    searchByName: {};
    constructor(usagerModel: Model<Usager>);
    create(usagersDto: UsagersDto): Promise<Usager>;
    patch(usagersDto: UsagersDto): Promise<Usager>;
    setDecision(usagerId: number, decision: Decision): Promise<Usager>;
    setRdv(usagerId: number, rdvDto: RdvDto): Promise<Usager>;
    deleteDocument(usagerId: number, index: any): Promise<Usager>;
    addDocument(usagerId: number, filename: string, filetype: string, label: string): Promise<Usager>;
    getDocument(usagerId: number, index: number): Promise<any>;
    findAll(): Promise<Usager[]>;
    findById(usagerId: number): Promise<Usager>;
    search(term?: string): Promise<Usager[]>;
    private findLastUsager;
    private lastId;
}
