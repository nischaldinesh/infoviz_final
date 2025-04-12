import DashboardLayout from "@/components/DashboardLayout";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
