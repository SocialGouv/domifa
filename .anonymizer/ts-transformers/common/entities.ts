import { firstName, fullName, lastName, randomInt, uuid } from "./data-helpers"

export { fakeDecision, fakeUserResume }

function fakeDecision(decision: any) {
  if (!decision) {
    return decision
  }

  return {
    ...decision,
    uuid: uuid(),
    motifDetails: null,
    orientationDetails: null,
    userId: randomInt(),
    userName: fullName(),
  }
}

function fakeUserResume(resume: any) {
  if (!resume) {
    return resume
  }

  const faked = { ...resume }

  if ("userName" in faked) {
    faked.userName = fullName()
  }
  if ("userId" in faked) {
    faked.userId = randomInt()
  }
  if ("nom" in faked) {
    faked.nom = lastName()
  }
  if ("prenom" in faked) {
    faked.prenom = firstName()
  }
  if ("id" in faked) {
    faked.id = randomInt()
  }

  return faked
}
