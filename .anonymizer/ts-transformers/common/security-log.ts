import { maskMiddle } from "./data-helpers"
import { pseudoIdentifier, pseudoUserAgent, pseudoUserName } from "./pseudonyms"

export { maskSecurityContext }

// `context` duplicates the flat columns at several nesting levels, hence the
// recursive walk.
const IP_KEYS = new Set(["ip", "oldIp", "newIp", "xForwardedFor", "xRealIp"])
const IDENTIFIER_KEYS = new Set(["email", "attemptedIdentifier", "login"])
const USER_NAME_KEYS = new Set(["userName", "createdBy"])

const DROPPED_KEYS = new Set(["headers"])

// Either "ip:<address>" or "user:<profile>:<id>".
function maskTracker(tracker: string): string {
  if (!tracker.startsWith("ip:")) {
    return tracker
  }

  return `ip:${maskMiddle(tracker.slice(3))}`
}

function maskValue(key: string, value: string): string | null {
  if (IP_KEYS.has(key)) {
    return maskMiddle(value)
  }
  if (IDENTIFIER_KEYS.has(key)) {
    return pseudoIdentifier(value)
  }
  if (USER_NAME_KEYS.has(key)) {
    return pseudoUserName(value)
  }
  if (key === "userAgent") {
    return pseudoUserAgent(value)
  }
  if (key === "tracker") {
    return maskTracker(value)
  }
  return value
}

function maskDeep(node: any): any {
  if (Array.isArray(node)) {
    return node.map(maskDeep)
  }

  if (node === null || typeof node !== "object") {
    return node
  }

  const entries = Object.entries(node)
    .filter(([key]) => !DROPPED_KEYS.has(key))
    .map(([key, value]) => {
      if (typeof value === "string") {
        return [key, maskValue(key, value)]
      }

      return [key, maskDeep(value)]
    })

  return Object.fromEntries(entries)
}

function maskSecurityContext(rawContext: string): string {
  const context = JSON.parse(rawContext)

  return JSON.stringify(context ? maskDeep(context) : null)
}
