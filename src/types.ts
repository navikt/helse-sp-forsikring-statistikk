export type Forsikringskategori = "KOLLEKTIV" | "NAV_KJØPT";

export interface PerForsikringstype {
  kategori: Forsikringskategori;
  forsikringstype: string;
  utbetaltIVentetid: number;
  utbetaltUtenomVentetid: number;
  totalt: number;
}

export interface UtbetalteSummerResponse {
  fom: string;
  tom: string;
  perForsikringstype: PerForsikringstype[];
}
