#!/usr/bin/env python3
from datetime import datetime
import json
import random
import signal
import sys
from uuid import uuid4

signal.signal(signal.SIGTERM, lambda sig, frame: exit(0))

def truncate_date_to_month_from_string(date_string):
    parsed_date = datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S.%fZ')
    truncated_date = parsed_date.replace(day=1)
    formatted_date = truncated_date.strftime('%Y-%m-%dT%H:%M:%S.%fZ')[:-4] + 'Z'
    return formatted_date

for json_line in sys.stdin:
    line = json.loads(json_line)

    historique = json.loads(line["historique"]["d"])
    if historique is None:
        sys.stdout.write(json.dumps(line) + "\n")

    def anonymize_decision(decision):
        anonymized_decision = decision.copy()
        anonymized_decision.update({
            "motifDetails": None,
            "orientationDetails": None,
            "userName": "toto",
            "userId": random.randint(1, 100000),
            "uuid": str(uuid4()),
            "dateDecision": truncate_date_to_month_from_string(decision["dateDecision"]) if decision["dateDecision"] else None,
        })
        return anonymized_decision
    
    anonymized_historique = [ anonymize_decision(decision) for decision in historique ]
    sys.stderr.write(f"Anonymized historique: {anonymized_historique}\n")
    line["historique"]["d"] = json.dumps(anonymized_historique)
    # Writing the result to stdout with new line and flushing the buffer
    sys.stdout.write(json.dumps(line) + "\n")
    sys.stdout.flush()