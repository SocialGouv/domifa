import { fakerFR as faker } from "@faker-js/faker";
import { main } from "./lib";
import { number, fullName, truncateDateToMonth as truncateDateToMonthFromString, uuid } from "./data-helpers";

const stdout = process.stdout
const stderr = process.stderr

function anonymize(line: Record<string, any>) {
    const historique = JSON.parse(line.historique.d);

    if (!historique) {
        stdout.write(JSON.stringify(line));
        return;
    }

    // stderr.write(`Anonymizing historique for usager ${historique} length: ${historique.length}\n`);
    const anonymisedHistorique = historique.map((decision: any) => {
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
