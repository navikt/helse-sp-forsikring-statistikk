import { logger } from "@navikt/next-logger";
import { teamLogger } from "@navikt/next-logger/team-log";

// team-log starter pino-socket i en worker og slår den opp på navn i runtime. Denne
// importen finnes bare for at Next skal spore pakken med i standalone-bygget.
import "pino-socket";

export { logger, teamLogger };

/**
 * Feltene openid-client legger på OPError. AADSTS-koden fra Entra ID ligger i
 * `error_description`, og uten den sitter vi bare igjen med en generisk melding.
 */
type OAuthFeil = Error & {
  error?: string;
  error_description?: string;
  error_uri?: string;
  response?: { statusCode?: number };
};

export function feilfelter(feil: unknown): Record<string, unknown> {
  if (!(feil instanceof Error)) {
    return { err: new Error(String(feil)) };
  }

  const oauthFeil = feil as OAuthFeil;
  return {
    err: feil,
    oauthError: oauthFeil.error,
    oauthErrorDescription: oauthFeil.error_description,
    oauthErrorUri: oauthFeil.error_uri,
    oauthStatusCode: oauthFeil.response?.statusCode,
  };
}

/**
 * Logger feilen i vanlig logg, og sender i tillegg detaljer som kan inneholde
 * persondata eller tokeninnhold til team logs.
 */
export function loggFeil(
  melding: string,
  feil: unknown,
  detaljerTilTeamLogs: Record<string, unknown>,
): void {
  const felter = feilfelter(feil);
  logger.error(felter, melding);
  try {
    teamLogger.error({ ...felter, ...detaljerTilTeamLogs }, melding);
  } catch (teamLogFeil) {
    // teamLogger kaster blant annet når nais-feltene mangler. Den feilen må aldri
    // skygge for feilen vi egentlig holdt på å logge.
    logger.error(
      { err: teamLogFeil instanceof Error ? teamLogFeil : new Error(String(teamLogFeil)) },
      "Klarte ikke å skrive til team logs",
    );
  }
}
