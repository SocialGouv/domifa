export function main<T extends { d: any }>(
  anonymize: (columns: Record<string, T[]>) => void
) {
  const stdin = process.stdin
  const stdout = process.stdout
  const stderr = process.stderr

  stderr.write("Anonymizer started\n")

  process.once("SIGTERM", () => {
    stderr.write("SIGTERM received\n")
  })

  stdin.on("data", function (lineBuffer) {
    try {
      const line: Record<string, T> = JSON.parse(lineBuffer.toString())
      const columns = Object.fromEntries(
        Object.entries(line).map(([columnName, columnValue]) => [
          columnName,
          columnValue.d,
        ])
      )
      anonymize(columns)
      const anonymizedLine = Object.fromEntries(
        Object.entries(columns).map(([columnName, columnValue]) => [
          columnName,
          { d: columnValue },
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

  stdin.on("end", function () {
    stderr.write("Anonymizer ended\n")
  })
}
