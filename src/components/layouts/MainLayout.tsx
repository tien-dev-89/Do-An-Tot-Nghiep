import NavbarTop from "@/components/layouts/NavbarTop";
import NavbarLeft from "@/components/layouts/NavbarLeft";
// import { ToastContainer } from "react-toastify";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5 h-auto">
      <NavbarLeft />
      <div className="flex-1 flex flex-col">
        <NavbarTop />
        <main className="flex-1 p-4 overflow-auto">
          {children}
          {/* <ToastContainer position="top-right" autoClose={3000} /> */}
        </main>
      </div>
    </div>
  );
}
