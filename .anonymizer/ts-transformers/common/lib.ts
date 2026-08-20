import { createInterface } from "node:readline"

type Attribute = { d: any; n?: boolean }

export function main(anonymize: (columns: Record<string, any>) => void) {
  const stdout = process.stdout
  const stderr = process.stderr

  stderr.write("Anonymizer started\n")

  process.once("SIGTERM", () => {
    stderr.write("SIGTERM received\n")
  })

  const lines = createInterface({ input: process.stdin })

  lines.on("line", function (line) {
    if (line.length === 0) {
      return
    }

    try {
      const attributes: Record<string, Attribute> = JSON.parse(line)
      const columns = Object.fromEntries(
        Object.entries(attributes).map(([columnName, attribute]) => [
          columnName,
          attribute.n ? null : attribute.d,
        ])
      )
      anonymize(columns)
      const anonymizedLine = Object.fromEntries(
        Object.entries(columns).map(([columnName, columnValue]) => [
          columnName,
          columnValue === null || columnValue === undefined
            ? { d: "", n: true }
            : { d: columnValue, n: false },
        ])
      )
      stdout.write(JSON.stringify(anonymizedLine) + "\n")
    } catch (error: unknown) {
      if (error instanceof Error) {
        stderr.write(`Error: ${error.message}\n`)
        stderr.write(`Stack: ${error.stack}\n`)
      } else {
        stderr.write(`Error: ${error}\n`)
      }
      process.exit(1)
    }
  })

  lines.on("close", function () {
    stderr.write("Anonymizer ended\n")
  })
}
