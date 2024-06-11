import { hashSync } from "bcryptjs"
import { main } from "./common/lib"

const __HASHED__PASSWORD__ = hashSync("DOMIFA_ANONYMIZER_PASSWORD", 10)

function anonymize(values: Record<string, any>) {
  values.password = __HASHED__PASSWORD__
}

main(["password"], anonymize)
