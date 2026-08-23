"use client";

import { useState } from "react";
import { logger } from "@navikt/next-logger";
import {
  Alert,
  BodyShort,
  Box,
  Button,
  DatePicker,
  Heading,
  Loader,
  Table,
  useRangeDatepicker,
  VStack,
} from "@navikt/ds-react";
import { formatKroner } from "@/lib/format";
import { UtbetalteSummerResponse } from "@/types";

function tilIsoDato(dato: Date): string {
  const år = dato.getFullYear();
  const måned = String(dato.getMonth() + 1).padStart(2, "0");
  const dag = String(dato.getDate()).padStart(2, "0");
  return `${år}-${måned}-${dag}`;
}

const kategoriTekst: Record<string, string> = {
  KOLLEKTIV: "Kollektiv",
  NAV_KJØPT: "Nav-kjøpt",
};

export default function Forsikringsstatistikk() {
  const [data, setData] = useState<UtbetalteSummerResponse | null>(null);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const { datepickerProps, fromInputProps, toInputProps, selectedRange } =
    useRangeDatepicker();

  async function hentStatistikk() {
    if (!selectedRange?.from || !selectedRange?.to) {
      setFeil("Velg både fra- og til-dato.");
      return;
    }
    setLaster(true);
    setFeil(null);
    try {
      const params = new URLSearchParams({
        fom: tilIsoDato(selectedRange.from),
        tom: tilIsoDato(selectedRange.to),
      });
      const response = await fetch(`/api/utbetaltesummer?${params}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Kunne ikke hente statistikk.");
      }
      setData((await response.json()) as UtbetalteSummerResponse);
    } catch (error) {
      logger.error(
        { err: error instanceof Error ? error : new Error(String(error)) },
        "Klarte ikke å hente statistikk",
      );
      setFeil(error instanceof Error ? error.message : "Uventet feil.");
      setData(null);
    } finally {
      setLaster(false);
    }
  }

  return (
    <Box paddingBlock="space-32" paddingInline={{ xs: "space-16", md: "space-40" }}>
      <VStack gap="space-24" className="mx-auto" style={{ maxWidth: "48rem" }}>
        <Heading size="large" level="1">
          Forsikringsstatistikk
        </Heading>
        <BodyShort>
          Utbetalte summer per forsikringstype for en valgt periode.
        </BodyShort>

        <DatePicker {...datepickerProps}>
          <VStack gap="space-16">
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <DatePicker.Input {...fromInputProps} label="Fra og med" />
              <DatePicker.Input {...toInputProps} label="Til og med" />
            </div>
            <Button
              type="button"
              onClick={hentStatistikk}
              loading={laster}
              style={{ alignSelf: "flex-start" }}
            >
              Hent statistikk
            </Button>
          </VStack>
        </DatePicker>

        {feil && (
          <Alert variant="error" role="alert">
            {feil}
          </Alert>
        )}

        {laster && <Loader size="large" title="Laster statistikk" />}

        {data && !laster && (
          <VStack gap="space-8">
            <Heading size="small" level="2">
              Periode {data.fom} – {data.tom}
            </Heading>
            <Table zebraStripes>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell scope="col">Forsikringstype</Table.HeaderCell>
                  <Table.HeaderCell scope="col">Kategori</Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    I ventetid
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    Utenom ventetid
                  </Table.HeaderCell>
                  <Table.HeaderCell scope="col" align="right">
                    Totalt
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.perForsikringstype.map((rad) => (
                  <Table.Row key={rad.forsikringstype}>
                    <Table.HeaderCell scope="row">
                      {rad.forsikringstype}
                    </Table.HeaderCell>
                    <Table.DataCell>
                      {kategoriTekst[rad.kategori] ?? rad.kategori}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {formatKroner(rad.utbetaltIVentetid)}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {formatKroner(rad.utbetaltUtenomVentetid)}
                    </Table.DataCell>
                    <Table.DataCell align="right">
                      {formatKroner(rad.totalt)}
                    </Table.DataCell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
