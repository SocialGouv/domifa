import {
  newUserStructureRepository,
  userStructureSecurityRepository,
} from "../../database";

const deleteUser = async ({
  userId,
  structureId,
}: {
  userId: number;
  structureId: number;
}) => {
  await userStructureSecurityRepository.delete({
    userId,
    structureId,
  });
  await newUserStructureRepository.delete({
    id: userId,
    structureId,
  });
};

const deleteUserByEmail = async (email: string) => {
  const user = await newUserStructureRepository.findOneBy({ email });
  if (user) {
    await deleteUser({ userId: user.id, structureId: user.structureId });
  }
};

export const usersDeletor = {
  deleteUser,
  deleteUserByEmail,
};
