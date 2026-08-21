import { getToken, requestAzureOboToken, validateAzureToken } from "@navikt/oasis";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class OboError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OboError";
  }
}

export async function hentOboToken(request: Request): Promise<string> {
  const token = getToken(request);
  if (!token) {
    throw new AuthError("Mangler Authorization-header");
  }

  const validering = await validateAzureToken(token);
  if (!validering.ok) {
    throw new AuthError(`Ugyldig token: ${validering.errorType}`);
  }

  const scope = process.env.SP_FORSIKRING_SCOPE;
  if (!scope) {
    throw new OboError("SP_FORSIKRING_SCOPE er ikke satt");
  }

  const obo = await requestAzureOboToken(token, scope);
  if (!obo.ok) {
    throw new OboError(`OBO-utveksling feilet: ${obo.error.message}`);
  }

  return obo.token;
}
