import { main } from "./common/lib"
import { pseudoUserAgent } from "./common/pseudonyms"

// `ip` has a UNIQUE index: the middle is filled from the row uuid rather than
// "*", otherwise two addresses could mask to the same value.
function fakeIp(ip: string, rowUuid: string): string {
  const filler = rowUuid.replaceAll("-", "")

  if (ip.length <= 4) {
    return filler.slice(0, ip.length)
  }

  return `${ip.slice(0, 2)}${filler.repeat(2).slice(0, ip.length - 4)}${ip.slice(
    -2
  )}`
}

function anonymize(values: Record<string, any>) {
  if (values.ip && values.ip !== "null") {
    values.ip = fakeIp(values.ip, values.uuid)
  }

  if (values.sources) {
    const sources = JSON.parse(values.sources)
    values.sources = JSON.stringify(
      (sources ?? []).map((source: any) => ({
        ...source,
        userAgent: source.userAgent ? pseudoUserAgent(source.userAgent) : null,
        context: null,
      }))
    )
  }
}

main(anonymize)
