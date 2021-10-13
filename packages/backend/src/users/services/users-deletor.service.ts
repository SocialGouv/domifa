import {
  userStructureRepository,
  userStructureSecurityRepository,
} from "../../database";

export const usersDeletor = {
  deleteUser,
};
async function deleteUser({
  userId,
  structureId,
}: {
  userId: number;
  structureId: number;
}) {
  await userStructureSecurityRepository.deleteByCriteria({
    userId,
    structureId,
  });
  await userStructureRepository.deleteByCriteria({
    id: userId,
    structureId,
  });
}
