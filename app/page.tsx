import { auth } from "@/lib/auth";
import { getWorkoutStats, getWorkouts, getActiveWorkout } from "@/lib/actions/workouts";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentWorkouts } from "@/components/dashboard/recent-workouts";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const session = await auth();
  const [stats, workouts, activeWorkout] = await Promise.all([
    getWorkoutStats(),
    getWorkouts(5),
    getActiveWorkout(),
  ]);

  // Serialize workouts for client components (convert Decimal to string)
  const serializedWorkouts = workouts.map((w) => ({
    ...w,
    sets: w.sets.map((s) => ({
      ...s,
      weight: s.weight.toString(),
    })),
  }));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <Header user={session?.user} title="Dashboard" />
        <main className="p-6 space-y-6">
          {/* Welcome message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gradient-electric">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Champion"}!
            </h2>
            <p className="text-muted-foreground">
              Ready to power up your workout? Here&apos;s your progress.
            </p>
          </div>

          {/* Stats */}
          <StatsCards stats={stats} />

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent workouts - takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentWorkouts workouts={serializedWorkouts} />
            </div>

            {/* Quick actions sidebar */}
            <div>
              <QuickActions
                hasActiveWorkout={!!activeWorkout}
                activeWorkoutId={activeWorkout?.id}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
