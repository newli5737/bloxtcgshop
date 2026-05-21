import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";

// Force dynamic rendering so parent layout gets x-pathname header
export const dynamic = "force-dynamic";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function AuthLayout({ children, params }: Props): Promise<ReactElement> {
  const { locale } = params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
