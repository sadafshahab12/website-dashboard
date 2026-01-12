import { Toaster } from "react-hot-toast";
import ClientLayout from "../components/ClientLayout";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientLayout>
      <Toaster position="top-right" />
      {children}
    </ClientLayout>
  );
}
