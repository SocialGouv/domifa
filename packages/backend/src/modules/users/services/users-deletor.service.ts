import {
  userStructureRepository,
  userStructureSecurityRepository,
} from "../../../database";

const deleteUser = async ({
  userId,
  structureId,
}: {
  userId: number;
  structureId: number;
}) => {
  await userStructureSecurityRepository.delete({
    userId,
  });

  await userStructureRepository.delete({
    id: userId,
    structureId,
  });
};

const deleteUserByEmail = async (email: string) => {
  const user = await userStructureRepository.findOneBy({ email });
  if (user) {
    await deleteUser({ userId: user.id, structureId: user.structureId });
  }
};

export const usersDeletor = {
  deleteUser,
  deleteUserByEmail,
};
