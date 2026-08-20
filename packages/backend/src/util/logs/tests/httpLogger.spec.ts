import { EventEmitter } from "events";
import { httpLogger } from "../AppLogger.service";

// `logHttpRequests` est désactivé en test : `setupLog` n'installe jamais ce
// middleware dans les suites, et un crash à l'intérieur traverse la CI sans
// bruit. C'est arrivé : le log de début de requête passait un objet partiel
// sous la clé `req`, dont le serializer pino attend une vraie requête
// Express — 500 sur chaque requête non-healthz, uniquement en déploiement
// réel. Ce spec appelle donc le middleware DIRECTEMENT.
const buildRequest = (originalUrl: string) =>
  ({
    headers: {},
    method: "POST",
    originalUrl,
    url: originalUrl,
    body: { email: "test@test.fr" },
  } as never);

const buildResponse = (): never => {
  const response = new EventEmitter() as EventEmitter & {
    statusCode: number;
  };
  response.statusCode = 200;
  return response as never;
};

describe("httpLogger", () => {
  it.each(["/structures/auth/login", "/healthz?marker=x", "/nonexistent"])(
    "laisse passer une requête %s sans lever",
    (url) => {
      const next = jest.fn();

      expect(() =>
        httpLogger(buildRequest(url), buildResponse(), next)
      ).not.toThrow();
      expect(next).toHaveBeenCalledTimes(1);
    }
  );

  it("laisse passer la sonde /healthz sans lever", () => {
    const next = jest.fn();

    expect(() =>
      httpLogger(buildRequest("/healthz"), buildResponse(), next)
    ).not.toThrow();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("journalise la fin de réponse sans lever, requête réelle ou partielle", () => {
    const next = jest.fn();
    const response = buildResponse();

    httpLogger(buildRequest("/api/usagers"), response, next);
    expect(() =>
      (response as unknown as EventEmitter).emit("finish")
    ).not.toThrow();
  });
});
