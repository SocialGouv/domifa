import { main } from "./common/lib"
import { maskMiddle } from "./common/data-helpers"
import { maskSecurityContext } from "./common/security-log"
import { pseudoUserAgent, pseudoUserName } from "./common/pseudonyms"

function anonymize(values: Record<string, any>) {
  values.ip = maskMiddle(values.ip)

  if (values.userAgent) {
    values.userAgent = pseudoUserAgent(values.userAgent)
  }

  if (values.userName) {
    values.userName = pseudoUserName(values.userName)
  }

  if (values.context) {
    values.context = maskSecurityContext(values.context)
  }
}

main(anonymize)
