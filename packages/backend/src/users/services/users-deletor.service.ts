import { userSecurityRepository, usersRepository } from "../../database";

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
  await usersRepository.deleteByCriteria({
    id: userId,
    structureId,
  });
}
