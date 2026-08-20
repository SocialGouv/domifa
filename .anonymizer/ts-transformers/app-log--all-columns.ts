import { main } from "./common/lib"
import { maskSecurityContext } from "./common/security-log"
import { pseudoUserName } from "./common/pseudonyms"

function anonymize(values: Record<string, any>) {
  if (values.userName) {
    values.userName = pseudoUserName(values.userName)
  }

  if (values.createdBy) {
    values.createdBy = pseudoUserName(values.createdBy)
  }

  if (values.context) {
    values.context = maskSecurityContext(values.context)
  }
}

main(anonymize)
