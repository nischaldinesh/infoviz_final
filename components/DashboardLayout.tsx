import Image from "next/image";
import Link from "next/link";
import { FaDatabase } from "react-icons/fa6";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-100 p-4 items-center justify-center flex">
        <h1 className="text-2xl font-bold text-black">
          Dashboard: &quot;Exploring the Prevalence of Heart Diseases&quot;
        </h1>
      </header>

      <div className="flex flex-1">
        <aside className="w-44 bg-gray-100 p-4">
          <div className="mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={200}
                height={200}
              />
            </Link>
          </div>
          <nav>
            <ul>
              <li className="mb-2">
                <Link
                  href="/dashboard/"
                  className="hover:text-blue-60 flex flex-row gap-2"
                >
                  <FaDatabase /> Upload Data
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/dashboard/scatterplot"
                  className="hover:text-blue-600"
                >
                  BP vs Cholesterol
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  href="/dashboard/summarycard"
                  className="hover:text-blue-600"
                >
                  Chest Pain Types
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href="/dashboard/categoricalplot"
                  className="hover:text-blue-600"
                >
                  Heart Severity
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/dashboard/grouped" className="hover:text-blue-600">
                  Grouped
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-4">{children}</main>
        {/* <aside className="w-64 bg-gray-50 p-4">
          <h2 className="text-lg font-semibold mb-4">Updates</h2>
          <ul>
            <li className="mb-2">Filters</li>
            <li className="mb-2">Sliders</li>
          </ul>
        </aside> */}
      </div>
    </div>
  );
}
