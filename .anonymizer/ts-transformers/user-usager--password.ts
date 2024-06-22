import { hashSync } from "bcryptjs"
import { main } from "./common/lib"

const __HASHED__PASSWORD__ = hashSync("domiF4_fakepwd", 10)

function anonymize(values: Record<string, any>) {
  values.password = __HASHED__PASSWORD__
}

main(["password"], anonymize)
