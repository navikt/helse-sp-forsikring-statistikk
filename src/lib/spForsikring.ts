import { UtbetalteSummerResponse } from "@/types";

const baseUrl = process.env.SP_FORSIKRING_URL ?? "http://sp-forsikring";

export async function hentUtbetalteSummer(
  fom: string,
  tom: string,
  oboToken: string,
): Promise<UtbetalteSummerResponse> {
  const url = new URL("/api/utbetalinger/utbetaltesummer", baseUrl);
  url.searchParams.set("fom", fom);
  url.searchParams.set("tom", tom);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${oboToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SpForsikringError(response.status, await response.text());
  }

  return (await response.json()) as UtbetalteSummerResponse;
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
