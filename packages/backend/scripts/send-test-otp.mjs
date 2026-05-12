#!/usr/bin/env node
import { randomInt } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../../../.env");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const user = env.DOMIFA_SMTP_USER;
const pass = env.DOMIFA_SMTP_PASS_DEV;

if (!user || !pass) {
  console.error("Missing DOMIFA_SMTP_USER or DOMIFA_SMTP_PASS_DEV in .env");
  process.exit(1);
}

const host = process.env.DOMIFA_SMTP_HOST ?? "smtp.tipimail.com";
const port = Number(process.env.DOMIFA_SMTP_PORT ?? 587);
const from =
  process.env.DOMIFA_SMTP_FROM ??
  "ne-pas-repondre@domifa.fabrique.social.gouv.fr";

const code = randomInt(100000, 999999).toString();

const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Votre code de connexion DomiFa</title>
  <style type="text/css">
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #ffffff; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { outline: none; text-decoration: none; border: none; -ms-interpolation-mode: bicubic; }
    a { color: #000091; text-decoration: underline; }
  </style>
</head>
<body bgcolor="#ffffff" style="margin: 0; padding: 0; background-color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="padding: 20px 15px 10px 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" valign="middle" style="text-align: left;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/republique-francaise-logo.png" alt="R&eacute;publique Fran&ccedil;aise" width="120" style="display: block; width: 120px; height: auto;"/>
                  </td>
                  <td width="50%" valign="middle" style="text-align: right;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/logo.png" alt="DomiFa" width="140" style="display: block; width: 140px; height: auto; margin-left: auto;"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e3e3fd; border-radius: 4px;">
                <tr>
                  <td style="padding: 25px 20px;">
                    <h1 style="margin: 0; color: #000091; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: bold; line-height: 1.3;">
                      Votre code de connexion
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 25px 15px 0 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">Bonjour,</td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 20px;">
                    Nous vous partageons votre code de s&eacute;curit&eacute; pour vous connecter sur DomiFa :
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 15px 0 20px 0;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 36px; font-weight: bold; color: #000091; letter-spacing: 6px; text-align: center;">${code}</div>
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    Ce code est valable seulement <strong>10 minutes</strong>. Au-del&agrave; de ce d&eacute;lai, vous devrez demander un nouveau code.
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    Ce code est strictement personnel et ne doit jamais &ecirc;tre communiqu&eacute;. Nous ne demandons jamais de code par t&eacute;l&eacute;phone.
                  </td>
                </tr>
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 5px;">Bien cordialement,</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 15px 30px 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000;">
                    &Agrave; tr&egrave;s bient&ocirc;t,<br/>L'&eacute;quipe DomiFa
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

const to = "test@surikat.pro";
console.log(`Sending OTP to ${to} via ${host}:${port} as ${from}`);

try {
  const result = await transporter.sendMail({
    from,
    to,
    subject: "Votre code de connexion DomiFa",
    html,
  });
  console.log(`OK — messageId: ${result.messageId}`);
  console.log(`Generated code (DO NOT LOG IN PROD): ${code}`);
} catch (err) {
  console.error("FAILED:", err.message);
  process.exit(1);
}
