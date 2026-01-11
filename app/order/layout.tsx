import ClientLayout from "../components/ClientLayout";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
