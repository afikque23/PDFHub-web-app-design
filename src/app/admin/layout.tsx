import { AdminLayout } from "@/components/admin/AdminLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDFHub Admin",
  description: "Admin Control Panel for PDFHub",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
