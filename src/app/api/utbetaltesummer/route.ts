import { NextRequest, NextResponse } from "next/server";
import { erGyldigIsoDato } from "@/lib/format";
import { AuthError, hentOboToken, OboError } from "@/lib/obo";
import { hentUtbetalteSummer, SpForsikringError } from "@/lib/spForsikring";

export async function GET(request: NextRequest) {
  const fom = request.nextUrl.searchParams.get("fom");
  const tom = request.nextUrl.searchParams.get("tom");

  if (!fom || !erGyldigIsoDato(fom)) {
    return NextResponse.json(
      { error: "fom må oppgis som en dato på formatet yyyy-MM-dd" },
      { status: 400 },
    );
  }
  if (!tom || !erGyldigIsoDato(tom)) {
    return NextResponse.json(
      { error: "tom må oppgis som en dato på formatet yyyy-MM-dd" },
      { status: 400 },
    );
  }
  if (fom > tom) {
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
      return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 });
    }
    if (error instanceof OboError) {
      return NextResponse.json(
        { error: "Kunne ikke autentisere mot sp-forsikring" },
        { status: 500 },
      );
    }
    if (error instanceof SpForsikringError) {
      return NextResponse.json(
        { error: "Kunne ikke hente statistikk fra sp-forsikring" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Uventet feil ved henting av statistikk" },
      { status: 500 },
    );
  }
}
