const nfKroner = new Intl.NumberFormat("nb-NO");

export function formatKroner(verdi: number): string {
  return nfKroner.format(verdi);
}

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

export function erGyldigIsoDato(verdi: string): boolean {
  if (!ISO_DATO.test(verdi)) return false;
  const dato = new Date(verdi);
  if (Number.isNaN(dato.getTime())) return false;
  return dato.toISOString().startsWith(verdi);
}
