import {
  userSecurityRepository,
  userStructureRepository,
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
  await userSecurityRepository.deleteByCriteria({
    userId,
    structureId,
  });
  await userStructureRepository.deleteByCriteria({
    id: userId,
    structureId,
  });
}
