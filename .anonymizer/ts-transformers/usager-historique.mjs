#!/usr/bin/env -S ./node_modules/.bin/tsx

import { main } from "./lib.mjs";
import { number, fullName, truncateDateToMonth as truncateDateToMonthFromString, uuid } from "./data-helpers.mjs";

const stdout = process.stdout
const stderr = process.stderr

function anonymize(line) {
    const historique = JSON.parse(line.historique.d);

    if (!historique) {
        stdout.write(JSON.stringify(line) + "\n");
        return;
    }

    // stderr.write(`Anonymizing historique for usager ${historique} length: ${historique.length}\n`);
    const anonymisedHistorique = historique.map((decision) => {
        return {
            ...decision,
            motifDetails: null, // TODO: incorrect? rather anonymize `motif` field?
            orientationDetails: null,
            userName: fullName(),
            userId: number(),
            uuid: uuid(),
            dateDecision: decision.dateDecision ?? truncateDateToMonthFromString(decision.dateDecision),
            // TODO anonymize other fields: dateDebut, dateFin, dateDecision
        }
    });

    line.historique.d = JSON.stringify(anonymisedHistorique);
    // stderr.write(JSON.stringify(line) + "\n");
    stdout.write(JSON.stringify(line) + "\n");
}

main(anonymize)
