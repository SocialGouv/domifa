import { main } from "./common/lib"
import { maskMiddle, uuid } from "./common/data-helpers"
import { pseudoUserAgent } from "./common/pseudonyms"

function maskSession(session: any) {
  if (!session) {
    return session
  }

  return {
    ...session,
    salt: uuid(),
    fingerprintHash: uuid(),
    ipAddress: maskMiddle(session.ipAddress),
    userAgent: session.userAgent ? pseudoUserAgent(session.userAgent) : null,
  }
}

function anonymize(values: Record<string, any>) {
  if (values.currentSession) {
    values.currentSession = JSON.stringify(
      maskSession(JSON.parse(values.currentSession))
    )
  }

  if (values.sessionsHistory) {
    const sessionsHistory = JSON.parse(values.sessionsHistory)
    values.sessionsHistory = JSON.stringify(
      (sessionsHistory ?? []).map(maskSession)
    )
  }
}

main(anonymize)
