import { UsagersDecisionControllerSecurityTests } from "./../usagers/controllers/security-tests/usagers-decision.security-tests";
import { StructuresAuthControllerSecurityTests } from "../auth/structures-auth.controller.security-tests";
import { InteractionsControllerSecurityTests } from "../interactions/interactions.controller.security-tests";
import { SmsControllerSecurityTests } from "../sms/sms.controller.security-tests";
import { StatsPrivateControllerSecurityTests } from "../stats/controllers/stats.private.controller.security-tests";
import { StatsPublicControllerSecurityTests } from "../stats/controllers/stats.public.controller.security-tests";
import { StructureDocControllerSecurityTests } from "../structures/controllers/structure-doc.controller.security-tests";
import { StructuresControllerSecurityTests } from "../structures/controllers/structures.controller.security-tests";
import { AgendaControllerSecurityTests } from "../usagers/controllers/security-tests/agenda.controller.security-tests";

import { ImportControllerSecurityTests } from "../usagers/controllers/import/import.controller.security-tests";
import { UsagersControllerSecurityTests } from "../usagers/controllers/security-tests/usagers.controller.security-tests";
import { UserControllerSecurityTests } from "../users/users.controller.security-tests";
import { UserPublicControllerSecurityTests } from "../users/users.public.controller.security-tests";
import { AdminStructuresDeleteControllerSecurityTests } from "../_portail-admin/admin-structures-delete/controllers/admin-structures-delete.controller.security-tests";
import { AdminStructuresControllerSecurityTests } from "../_portail-admin/admin-structures/controllers/admin-structures.controller.security-tests";
import { AppTestHttpClientSecurityTestDef } from "./_core/AppTestHttpClientSecurityTestDef.type";
import {
  UsagerDocsControllerSecurityTests,
  ExportStructureUsagersControllerSecurityTests,
  UsagersStructureDocsControllerSecurityTests,
} from "../usagers/controllers/security-tests";

export const API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS: AppTestHttpClientSecurityTestDef[] =
  [
    ...AgendaControllerSecurityTests,
    ...AdminStructuresControllerSecurityTests,
    ...AdminStructuresDeleteControllerSecurityTests,
    ...UsagerDocsControllerSecurityTests,
    ...UsagersDecisionControllerSecurityTests,
    ...ExportStructureUsagersControllerSecurityTests,
    ...ImportControllerSecurityTests,
    ...SmsControllerSecurityTests,
    ...StatsPrivateControllerSecurityTests,
    ...StatsPublicControllerSecurityTests,
    ...StructureDocControllerSecurityTests,
    ...StructuresControllerSecurityTests,
    ...UsagersControllerSecurityTests,
    ...UserControllerSecurityTests,
    ...UserPublicControllerSecurityTests,
    ...UsagersStructureDocsControllerSecurityTests,
    ...InteractionsControllerSecurityTests,
    ...StructuresAuthControllerSecurityTests,
  ];
