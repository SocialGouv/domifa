import { main } from "./common/lib"

function anonymize(values: Record<string, any>) {
  values.email = `${values.role}-${values.structureId}-${values.id}@domifa-fake.fabrique.social.gouv.fr`
}

main(["email"], anonymize)
