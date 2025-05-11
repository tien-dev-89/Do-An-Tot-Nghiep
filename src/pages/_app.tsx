import "@/styles/globals.css";
import type { AppProps } from "next/app";
import MainLayout from "@/components/layouts/MainLayout";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const noLayout = ["/auths/login", "/auths/forgot-password"]; // Route không dùng layout

  const isNoLayout = noLayout.includes(router.pathname);

  return isNoLayout ? (
    <Component {...pageProps} />
  ) : (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
