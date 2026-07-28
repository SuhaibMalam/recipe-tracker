import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const displayName = session.user.name || session.user.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-green-600">
          Recipe Tracker
        </span>
        <SignOutButton />
      </nav>

      <main className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome, {displayName}
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Here&apos;s your recipe and nutrition overview.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 flex flex-col items-center text-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">
            No recipes yet
          </h2>
          <p className="text-gray-500 text-sm max-w-sm">
            Your saved recipes and nutrition stats will show up here once
            recipe tracking is wired up.
          </p>
        </div>
      </main>
    </div>
  );
}
