import { main } from "./common/lib"
import { truncateDateColumnToMonth } from "./common/data-helpers"

const TRUNCATED_COLUMNS = ["dateNaissance", "dateDebut", "dateFin"]

function anonymize(values: Record<string, any>) {
  for (const column of TRUNCATED_COLUMNS) {
    if (values[column]) {
      values[column] = truncateDateColumnToMonth(values[column])
    }
  }
}

main(anonymize)
