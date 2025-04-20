import DashboardLayout from "@/components/DashboardLayout";
import { DataProvider } from "./DataContext";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DataProvider>
  );
}
