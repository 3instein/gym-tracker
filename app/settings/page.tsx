import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Zap, LogOut, User } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function SettingsPage() {
    const session = await auth();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 md:ml-64">
                <Header user={session?.user} title="Settings" />
                <main className="p-6 space-y-6">
                    {/* Header */}
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Settings className="h-6 w-6 text-electric" />
                            <span className="text-gradient-electric">Settings</span>
                        </h2>
                        <p className="text-muted-foreground">
                            Manage your account and app preferences.
                        </p>
                    </div>

                    {/* Profile Card */}
                    <Card className="card-electric">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-electric" />
                                Profile
                            </CardTitle>
                            <CardDescription>
                                Your account information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                {session?.user?.image ? (
                                    <Avatar className="h-16 w-16 ring-2 ring-electric/50">
                                        <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
                                        <AvatarFallback className="bg-gradient-electric text-2xl font-bold text-background">
                                            {session.user.name?.[0] || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-electric text-2xl font-bold text-background">
                                        {session?.user?.name?.[0] || "U"}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-lg">{session?.user?.name || "User"}</p>
                                    <p className="text-muted-foreground">{session?.user?.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* App Info Card */}
                    <Card className="card-electric">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-electric" />
                                GymTracker
                            </CardTitle>
                            <CardDescription>
                                Track your gains with electric precision
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>Version 1.0.0</p>
                                <p>Built with Next.js, Prisma, and Tailwind CSS</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sign Out */}
                    <Card className="card-electric border-destructive/20">
                        <CardContent className="pt-6">
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut({ redirectTo: "/login" });
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
