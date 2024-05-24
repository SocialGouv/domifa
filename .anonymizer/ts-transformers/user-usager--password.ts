import { hash } from "bcryptjs";
import { main } from "./common/lib"

const __HASHED__PASSWORD__ = hash("DOMIFA_ANONYMIZER_PASSWORD", 10)

function anonymize(values: Record<string, any>) {
  values.password = __HASHED__PASSWORD__
  process.stderr.write(JSON.stringify(values))
}

main(["password"], anonymize)
