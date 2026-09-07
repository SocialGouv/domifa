const repository = {
  findOneBy: jest.fn(),
  findOneByOrFail: jest.fn(),
};
const securityRepository = {
  findOneByOrFail: jest.fn(),
  update: jest.fn(),
};
const applyNewPassword = jest.fn();

jest.mock("../get-user-repository.service", () => ({
  getUserRepository: () => repository,
  getUserSecurityRepository: () => securityRepository,
}));
jest.mock("../../../app-logs/app-log-security-writer", () => ({
  logSecurityEventForUser: jest.fn(),
}));
jest.mock("../userPasswordWriter.service", () => ({
  userPasswordWriter: { applyNewPassword },
}));

import { userSecurityResetPasswordUpdater } from "../userSecurityResetPasswordUpdater.service";

describe("userSecurityResetPasswordUpdater.confirmResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    repository.findOneBy.mockResolvedValue({ id: 42, status: "PENDING" });
    repository.findOneByOrFail.mockResolvedValue({
      id: 42,
      status: "PENDING",
      structureId: 7,
    });
    securityRepository.findOneByOrFail.mockResolvedValue({
      userId: 42,
      temporaryTokens: {
        token: "valid-token",
        validity: new Date(Date.now() + 60_000),
      },
    });
  });

  it("preserves a pending account while resetting its password", async () => {
    await userSecurityResetPasswordUpdater.confirmResetPassword({
      userId: 42,
      token: "valid-token",
      newPassword: "new-password",
      userProfile: "structure",
    });

    expect(applyNewPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ status: "PENDING" }),
        activatePendingAccount: false,
      })
    );
  });
});
