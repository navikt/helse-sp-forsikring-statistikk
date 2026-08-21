import "@navikt/ds-css";
import type { Metadata } from "next";
import { Page } from "@navikt/ds-react";

export const metadata: Metadata = {
  title: "Forsikringsstatistikk | Nav",
  description: "Utbetalte summer per forsikringstype",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb" data-theme="light">
      <body>
        <Page>{children}</Page>
      </body>
    </html>
  );
}
