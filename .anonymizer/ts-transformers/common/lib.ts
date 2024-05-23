export function main<T>(anonymize: (line: Record<string, T>) => void) {
  const stdin = process.stdin
  const stderr = process.stderr

  stderr.write("Anonymizer started\n")

  process.once("SIGTERM", () => {
    stderr.write("SIGTERM received\n")
    process.exit(0)
  })

  stdin.on("data", function (lineBuffer) {
    try {
      const line = JSON.parse(lineBuffer.toString())
      anonymize(line)
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
