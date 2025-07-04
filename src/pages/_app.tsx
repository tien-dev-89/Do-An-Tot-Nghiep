// import "@/styles/globals.css";
// import type { AppProps } from "next/app";
// // import MainLayout from "@/components/layouts/MainLayout";
// import { useRouter } from "next/router";
// import AuthWrapper from "@/components/AuthWrapper";

// export default function App({ Component, pageProps }: AppProps) {
//   const router = useRouter();

//   const noLayout = ["/auths/login", "/auths/forgot-password"]; // Route không dùng layout

//   const isNoLayout = noLayout.includes(router.pathname);

//   return isNoLayout ? (
//     // <Component {...pageProps} />
//     <AuthWrapper>
//       <Component {...pageProps} />
//     </AuthWrapper>
//   ) : (
//     // <MainLayout>
//     //   <Component {...pageProps} />
//     // </MainLayout>
//     <AuthWrapper>
//       <Component {...pageProps} />
//     </AuthWrapper>
//   );
// }

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import AuthWrapper from "@/components/AuthWrapper";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Uncomment nếu cần dùng MainLayout
// import MainLayout from "@/components/layouts/MainLayout";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const noLayout = ["/auths/login", "/auths/forgot-password"]; // Route không dùng layout
  const isNoLayout = noLayout.includes(router.pathname);

  return isNoLayout ? (
    <>
      <AuthWrapper>
        {/* Uncomment nếu cần dùng MainLayout */}
        {/* {isNoLayout ? (
          <Component {...pageProps} />
        ) : (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        )} */}
        <Component {...pageProps} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthWrapper>
    </>
  ) : (
    // <MainLayout>
    //   <Component {...pageProps} />
    // </MainLayout>
    <AuthWrapper>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthWrapper>
  );
}
