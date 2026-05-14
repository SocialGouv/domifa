export function generateOtpEmailHtml(params: { code: string }): string {
  const { code } = params;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
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

          <!-- Header logos -->
          <tr>
            <td style="padding: 20px 15px 10px 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="50%" valign="middle" style="text-align: left;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/logo-ministere.jpg" alt="Minist&egrave;re du Travail, de la Sant&eacute;, des Solidarit&eacute;s et des Familles" width="100" style="display: block; width: 100px; height: auto;"/>
                  </td>
                  <td width="50%" valign="middle" style="text-align: right;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/logo.png" alt="DomiFa" width="140" style="display: block; width: 140px; height: auto; margin-left: auto;"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Blue banner -->
          <tr>
            <td style="padding: 0 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e3e3fd; border-radius: 4px;">
                <tr>
                  <td width="60%" valign="middle" style="padding: 25px 20px;">
                    <h1 style="margin: 0; color: #000091; font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: bold; line-height: 1.3;">
                      Votre code de connexion
                    </h1>
                  </td>
                  <td width="40%" valign="middle" style="padding: 10px 15px; text-align: right;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/login/login-container.svg" alt="" width="180" style="display: inline-block; width: 180px; max-width: 100%; height: auto;"/>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding: 25px 15px 0 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">

                <!-- Greeting -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    Bonjour,
                  </td>
                </tr>

                <!-- Intro text -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 20px;">
                    Nous vous partageons votre code de s&eacute;curit&eacute; pour vous connecter sur DomiFa :
                  </td>
                </tr>

                <!-- OTP Code -->
                <tr>
                  <td align="center" style="padding: 15px 0 20px 0;">
                    <div style="font-family: Arial, Helvetica, sans-serif; font-size: 36px; font-weight: bold; color: #000091; letter-spacing: 6px; text-align: center;">
                      ${code}
                    </div>
                  </td>
                </tr>

                <!-- Validity -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    Ce code est valable seulement <strong>10 minutes</strong>. Au-del&agrave; de ce d&eacute;lai, vous devrez demander un nouveau code.
                  </td>
                </tr>

                <!-- Security warning -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    Ce code est strictement personnel et ne doit jamais &ecirc;tre communiqu&eacute;. Nous ne demandons jamais de code par t&eacute;l&eacute;phone.
                  </td>
                </tr>

                <!-- If you initiated -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 10px;">
                    &#9989; Si vous &ecirc;tes &agrave; l'origine de cette connexion ne tenez pas compte de ce message.
                  </td>
                </tr>

                <!-- If you didn't initiate -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    &#10060; Si vous n'&ecirc;tes pas &agrave; l'origine de cette demande, renouvelez votre mot de passe.
                  </td>
                </tr>

                <!-- Attention block -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 15px;">
                    <strong>Attention :</strong> En cas de signalement d'une connexion dont vous n'&ecirc;tes pas &agrave; l'origine, l'acc&egrave;s &agrave; votre espace personnel sera temporairement suspendu pour des raisons de s&eacute;curit&eacute;.
                  </td>
                </tr>

                <!-- Auto-generated notice -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 20px;">
                    Cet email vous est envoy&eacute; automatiquement. Merci de ne pas utiliser la fonction "r&eacute;pondre &agrave; l'exp&eacute;diteur".
                  </td>
                </tr>

                <!-- Closing -->
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000; padding-bottom: 5px;">
                    Bien cordialement,
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 15px 30px 15px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.5; color: #000000;">
                    &Agrave; tr&egrave;s bient&ocirc;t,<br/>
                    L'&eacute;quipe DomiFa
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 15px;">
                    <img src="https://domifa.fabrique.social.gouv.fr/assets/images/logo.png" alt="DomiFa" width="142" style="display: block; width: 142px; height: auto;"/>
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
}
