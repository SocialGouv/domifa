import { DOMIFA_ADMIN_STRUCTURE_ID } from "../../../auth/services";
import { PortailAdminUser } from "../../../_common/model/_portail-admin";
import { UserStructureTable } from "../../entities";
import { pgRepository, PgRepositoryFindOptions } from "../_postgres";

// Note: pour l'instant, les user admin sont des stockés dans la table UserStructure. Ce sont les users de la structure 1 dont le role est "admin".
export const USER_ADMIN_PROFILE_ATTRIBUTES: (keyof UserStructureTable)[] = [
  "uuid",
  "createdAt",
  "updatedAt",
  "version",
  "id",
  "prenom",
  "nom",
  "email",
];

const baseRepository = pgRepository.get<UserStructureTable, PortailAdminUser>(
  UserStructureTable,
  {
    defaultSelect: USER_ADMIN_PROFILE_ATTRIBUTES,
  }
);

export const userAdminRepository = {
  // NOTE: ne pas exposer directement `baseRepository`, car il faut ajouter les filtres `role: 'admin' & structureId: 1` sur les méthodes de recherche
  count: (
    {
      where = {},
      ...attrs
    }: {
      where?: Partial<UserStructureTable>;
      countAttribute?: string;
      logSql?: boolean;
      params?: { [attr: string]: any };
    } = {
      countAttribute: "uuid",
    }
  ) =>
    baseRepository.count({
      ...attrs,
      where: {
        ...where,
        role: "admin",
        structureId: DOMIFA_ADMIN_STRUCTURE_ID,
      },
    }),
  findOne: (
    search: Partial<UserStructureTable>,
    options: PgRepositoryFindOptions<UserStructureTable> = {}
  ) =>
    baseRepository.findOne<PortailAdminUser>(
      {
        ...search,
        role: "admin",
        structureId: DOMIFA_ADMIN_STRUCTURE_ID,
      },
      options
    ),
  findMany: (
    search: Partial<UserStructureTable>,
    options: PgRepositoryFindOptions<UserStructureTable> = {}
  ) =>
    baseRepository.findMany<PortailAdminUser[]>(
      {
        ...search,
        role: "admin",
        structureId: DOMIFA_ADMIN_STRUCTURE_ID,
      },
      options
    ),
  updateOne: (
    search: Partial<UserStructureTable>,
    data: Partial<UserStructureTable>,
    options: PgRepositoryFindOptions<UserStructureTable> & {
      returnSearch?: Partial<UserStructureTable>;
    } = {}
  ) =>
    baseRepository.updateOne<PortailAdminUser>(
      {
        ...search,
        role: "admin",
        structureId: DOMIFA_ADMIN_STRUCTURE_ID,
      },
      data,
      options
    ),
};
