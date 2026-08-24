export interface PerForsikringstype {
  navn: string;
  utbetaltIVentetid: number;
  utbetaltUtenomVentetid: number;
  totalt: number;
}

export interface UtbetalteSummerResponse {
  fom: string;
  tom: string;
  perForsikringstype: PerForsikringstype[];
}
