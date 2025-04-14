import { UsagersDecisionControllerSecurityTests } from "./../usagers/controllers/security-tests/usagers-decision.security-tests";
import { StructuresAuthControllerSecurityTests } from "../auth/structures-auth.controller.security-tests";
import { InteractionsControllerSecurityTests } from "../modules/interactions/interactions.controller.security-tests";

import { StructureDocControllerSecurityTests } from "../modules/structures/controllers/structure-doc.controller.security-tests";
import { StructuresControllerSecurityTests } from "../modules/structures/controllers/structures.controller.security-tests";
import { AgendaControllerSecurityTests } from "../usagers/controllers/security-tests/agenda.controller.security-tests";

import { ImportControllerSecurityTests } from "../usagers/controllers/import/import.controller.security-tests";
import { UsagersControllerSecurityTests } from "../usagers/controllers/security-tests/usagers.controller.security-tests";
import { UserControllerSecurityTests } from "../modules/users/controllers/users.controller.security-tests";
import { UserPublicControllerSecurityTests } from "../modules/users/controllers/users.public.controller.security-tests";
import { AdminStructuresDeleteControllerSecurityTests } from "../modules/portail-admin/controllers/admin-structures-delete/admin-structures-delete.controller.security-tests";
import { AdminStructuresControllerSecurityTests } from "../modules/portail-admin/controllers/admin-structures/admin-structures.controller.security-tests";
import { AppTestHttpClientSecurityTestDef } from "./_core/types/AppTestHttpClientSecurityTestDef.type";
import {
  UsagerDocsControllerSecurityTests,
  ExportStructureUsagersControllerSecurityTests,
  UsagersStructureDocsControllerSecurityTests,
} from "../usagers/controllers/security-tests";
import { SmsControllerSecurityTests } from "../modules/sms/sms.controller.security-tests";
import { StatsPrivateControllerSecurityTests } from "../modules/stats/controllers/stats.private.controller.security-tests";
import { StatsPublicControllerSecurityTests } from "../modules/stats/controllers/stats.public.controller.security-tests";

export const API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS: AppTestHttpClientSecurityTestDef[] =
  [
    ...AdminStructuresControllerSecurityTests,
    ...AdminStructuresDeleteControllerSecurityTests,
    ...AgendaControllerSecurityTests,
    ...ExportStructureUsagersControllerSecurityTests,
    ...ImportControllerSecurityTests,
    ...InteractionsControllerSecurityTests,
    ...SmsControllerSecurityTests,
    ...StatsPrivateControllerSecurityTests,
    ...StatsPublicControllerSecurityTests,
    ...StructureDocControllerSecurityTests,
    ...StructuresAuthControllerSecurityTests,
    ...StructuresControllerSecurityTests,
    ...UsagerDocsControllerSecurityTests,
    ...UsagersControllerSecurityTests,
    ...UsagersDecisionControllerSecurityTests,
    ...UsagersStructureDocsControllerSecurityTests,
    ...UserControllerSecurityTests,
    ...UserPublicControllerSecurityTests,
  ];
