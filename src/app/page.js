import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-green-600">Recipe Tracker</h1>
      <p className="text-gray-500">
        Your personal recipe and nutrition journal
      </p>
      <div className="flex gap-4 mt-4">
        <Link
          href="/login"
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="px-6 py-2 border border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
