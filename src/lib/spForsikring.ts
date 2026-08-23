import { UtbetalteSummerResponse } from "@/types";
import { loggFeil } from "@/lib/logg";

const baseUrl = process.env.SP_FORSIKRING_URL ?? "http://sp-forsikring";

export async function hentUtbetalteSummer(
  fom: string,
  tom: string,
  oboToken: string,
): Promise<UtbetalteSummerResponse> {
  const url = new URL("/api/utbetalinger/utbetaltesummer", baseUrl);
  url.searchParams.set("fom", fom);
  url.searchParams.set("tom", tom);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${oboToken}` },
      cache: "no-store",
    });
  } catch (error) {
    loggFeil(`Kallet mot sp-forsikring på ${url.pathname} feilet`, error, {
      url: url.toString(),
    });
    throw new SpForsikringNedeError(
      `Fikk ikke kontakt med sp-forsikring på ${baseUrl}`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw new SpForsikringError(response.status, await response.text());
  }

  return (await response.json()) as UtbetalteSummerResponse;
}

export class SpForsikringNedeError extends Error {
  constructor(message: string, options: { cause: unknown }) {
    super(message, options);
    this.name = "SpForsikringNedeError";
  }
}

export class SpForsikringError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`sp-forsikring svarte ${status}`);
    this.name = "SpForsikringError";
  }
}
