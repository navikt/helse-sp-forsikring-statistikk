import { UtbetalteSummerResponse } from "@/types";

const SKILLETEGN = ";";
const LINJESKIFT = "\r\n";

function escapeFelt(verdi: string): string {
  if (/[";\r\n]/.test(verdi)) {
    return `"${verdi.replace(/"/g, '""')}"`;
  }
  return verdi;
}

function lagRad(felter: (string | number)[]): string {
  return felter.map((felt) => escapeFelt(String(felt))).join(SKILLETEGN);
}

export function tilCsv(data: UtbetalteSummerResponse): string {
  const rader = [
    lagRad(["Type", "I ventetid", "Utenom ventetid", "Totalt"]),
    ...data.perForsikringstype.map((rad) =>
      lagRad([
        rad.navn,
        rad.utbetaltIVentetid,
        rad.utbetaltUtenomVentetid,
        rad.totalt,
      ]),
    ),
  ];
  return rader.join(LINJESKIFT);
}

export function csvFilnavn(data: UtbetalteSummerResponse): string {
  return `forsikringsstatistikk_${data.fom}_${data.tom}.csv`;
}
