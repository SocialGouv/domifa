import {
  userStructureRepository,
  UserStructureSecurityRepository,
} from "../../database";

const deleteUser = async ({
  userId,
  structureId,
}: {
  userId: number;
  structureId: number;
}) => {
  await UserStructureSecurityRepository.delete({
    userId,
    structureId,
  });
  await userStructureRepository.deleteByCriteria({
    id: userId,
    structureId,
  });
};

const deleteUserByEmail = async (email: string) => {
  const user = await userStructureRepository.findOne({ email });
  if (user)
    await deleteUser({ userId: user.id, structureId: user.structureId });
};

export const usersDeletor = {
  deleteUser,
  deleteUserByEmail,
};
