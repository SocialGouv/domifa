#!/usr/bin/env python3
from datetime import datetime
import json
import random
import signal
import sys
from uuid import uuid4

signal.signal(signal.SIGTERM, lambda sig, frame: exit(0))

FONCTIONS = (
        "Agent administratif",
        "Agent d'accueil",
        "Educateur Spécialisé",
        "Président",
        "Responsable de service",
        "Travailleur social",
        None,
        None,
        None,
)

for json_line in sys.stdin:
    line = json.loads(json_line)
    new_fonction = FONCTIONS[random.randint(0, len(FONCTIONS) - 1)] 

    if new_fonction is None:
        line.update({"fonction": {"d": "", "n": True}})
    else:
        line.update({"fonction": {"d": new_fonction, "n": False}}) 

    sys.stdout.write(json.dumps(line) + "\n")
    sys.stdout.flush()
