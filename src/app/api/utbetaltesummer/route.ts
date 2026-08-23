import { NextRequest, NextResponse } from "next/server";
import { loggFeil, logger } from "@/lib/logg";
import { erGyldigIsoDato } from "@/lib/format";
import { AuthError, hentOboToken, OboError } from "@/lib/obo";
import {
  hentUtbetalteSummer,
  SpForsikringError,
  SpForsikringNedeError,
} from "@/lib/spForsikring";

export async function GET(request: NextRequest) {
  const fom = request.nextUrl.searchParams.get("fom");
  const tom = request.nextUrl.searchParams.get("tom");

  if (!fom || !erGyldigIsoDato(fom)) {
    logger.warn({ fom }, "Avviste kall med ugyldig fom-dato");
    return NextResponse.json(
      { error: "fom må oppgis som en dato på formatet yyyy-MM-dd" },
      { status: 400 },
    );
  }
  if (!tom || !erGyldigIsoDato(tom)) {
    logger.warn({ tom }, "Avviste kall med ugyldig tom-dato");
    return NextResponse.json(
      { error: "tom må oppgis som en dato på formatet yyyy-MM-dd" },
      { status: 400 },
    );
  }
  if (fom > tom) {
    logger.warn({ fom, tom }, "Avviste kall der fom er etter tom");
    return NextResponse.json(
      { error: "fom kan ikke være etter tom" },
      { status: 400 },
    );
  }

  try {
    const oboToken = await hentOboToken(request);
    const data = await hentUtbetalteSummer(fom, tom, oboToken);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AuthError) {
      loggFeil("Avviste kall som ikke var autorisert", error, { fom, tom });
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }
    if (error instanceof OboError) {
      loggFeil("Kunne ikke autentisere mot sp-forsikring", error, { fom, tom });
      return NextResponse.json(
        { error: "Kunne ikke autentisere mot sp-forsikring" },
        { status: 500 },
      );
    }
    if (error instanceof SpForsikringError) {
      loggFeil(`sp-forsikring svarte ${error.status}`, error, {
        fom,
        tom,
        responseBody: error.body,
      });
      return NextResponse.json(
        { error: "Kunne ikke hente statistikk fra sp-forsikring" },
        { status: 502 },
      );
    }
    if (error instanceof SpForsikringNedeError) {
      return NextResponse.json(
        { error: "Fikk ikke kontakt med sp-forsikring" },
        { status: 502 },
      );
    }
    loggFeil("Uventet feil ved henting av statistikk", error, { fom, tom });
    return NextResponse.json(
      { error: "Uventet feil ved henting av statistikk" },
      { status: 500 },
    );
  }
}
