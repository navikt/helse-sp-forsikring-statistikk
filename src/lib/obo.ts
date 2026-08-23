import { getToken, requestAzureOboToken, validateAzureToken } from "@navikt/oasis";
import { loggFeil, logger } from "@/lib/logg";

export class AuthError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.name = "AuthError";
  }
}

export class OboError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.name = "OboError";
  }
}

export async function hentOboToken(request: Request): Promise<string> {
  const token = getToken(request);
  if (!token) {
    logger.warn("Mangler Authorization-header på kall mot API-et");
    throw new AuthError("Mangler Authorization-header");
  }

  const validering = await validateAzureToken(token);
  if (!validering.ok) {
    loggFeil(
      `Validering av innkommende token feilet: ${validering.errorType}`,
      validering.error,
      { errorType: validering.errorType },
    );
    throw new AuthError(`Ugyldig token: ${validering.errorType}`, {
      cause: validering.error,
    });
  }

  const scope = process.env.SP_FORSIKRING_SCOPE;
  if (!scope) {
    const feil = new Error("SP_FORSIKRING_SCOPE er ikke satt");
    loggFeil("OBO-utveksling er umulig fordi SP_FORSIKRING_SCOPE mangler", feil, {});
    throw new OboError("SP_FORSIKRING_SCOPE er ikke satt", { cause: feil });
  }

  const obo = await requestAzureOboToken(token, scope);
  if (!obo.ok) {
    loggFeil(`OBO-utveksling mot ${scope} feilet`, obo.error, {
      scope,
      aud: validering.payload.aud,
      azp: validering.payload.azp,
      oid: validering.payload.oid,
      scp: validering.payload.scp,
    });
    throw new OboError(`OBO-utveksling feilet: ${obo.error.message}`, {
      cause: obo.error,
    });
  }

  return obo.token;
}
