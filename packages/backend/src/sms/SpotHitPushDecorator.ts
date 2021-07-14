import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SuiviSmsDto } from "./suivi-sms.dto";

export const SpotHitPushDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const result = new SuiviSmsDto();

    console.log(req.query);
    result.id_accuse = req.query?.id_accuse || null;
    result.id_message = req.query?.id_message || null;
    result.numero = req.query?.numero || null;
    result.statut = req.query?.statut || null;

    result.date_envoi = new Date(req.query?.date_envoi * 1000);
    result.date_update = new Date(req.query?.date_update * 1000);
    result.statut_code = req.query?.statut_code || null;
    result.nom = req.query?.nom || null;

    return result;
  }
);
