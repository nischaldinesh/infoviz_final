import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/assets/hero.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 text-center p-10 max-w-3xl">
        <h1 className="text-5xl font-bold text-white mb-4">
          Exploring the Prevalence of Heart Diseases
        </h1>
        <p className="text-2xl font-bold text-white mb-2 ">
          Team Members: Jamil Ahmed, Nischal Dinesh, Alline Ibraimo, Anushree
          Logitla
        </p>
        <p className="text-xl font-bold text-white mb-6">
          Professor: Ghulam jilani Quadri
        </p>

        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
