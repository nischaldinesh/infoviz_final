import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/assets/hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 text-center p-10 max-w-4xl">
        <h1 className="text-5xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
          Exploring the Prevalence of Heart Diseases
        </h1>

        <p className="text-lg font-medium text-white mb-2 tracking-wide drop-shadow-md">
          <span className="uppercase text-gray-300 font-semibold mr-2">
            Team Members:
          </span>
          Nischal Dinesh, Alline Ibraimo, Anushree Logitla, Jamil Ahmed
        </p>

        <p className="text-lg font-medium text-white mb-8 drop-shadow-md">
          <span className="uppercase text-gray-300 font-semibold mr-2">
            Professor:
          </span>
          Ghulam Jilani Quadri
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 shadow-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
