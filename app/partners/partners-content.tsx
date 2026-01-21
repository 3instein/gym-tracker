"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { searchUsers, invitePartner, removePartner, getPartners } from "@/lib/actions/partners";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PartnersContent() {
    const [data, setData] = useState<{ myPartners: any[]; accountsIManage: any[] } | null>(null);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);

    // Initial fetch
    useEffect(() => {
        let active = true;
        getPartners()
            .then((res) => {
                if (active) setData(res);
            })
            .catch((err) => {
                if (active) toast.error("Failed to load partners");
            });
        return () => { active = false; };
    }, []);

    const handleSearch = async (val: string) => {
        setQuery(val);
        if (val.length < 3) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchUsers(val);
            setSearchResults(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(timeoutId);
        if (val.length >= 3) {
            setIsSearching(true);
            const id = setTimeout(async () => {
                const results = await searchUsers(val);
                setSearchResults(results);
                setIsSearching(false);
            }, 500);
            setTimeoutId(id);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleInvite = (email: string) => {
        startTransition(async () => {
            try {
                await invitePartner(email);
                toast.success("Partner added successfully");
                setDialogOpen(false);
                setQuery("");
                setSearchResults([]);

                // Refresh list
                const newData = await getPartners();
                setData(newData);
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    };

    const handleRemove = (partnerId: string) => {
        startTransition(async () => {
            try {
                await removePartner(partnerId);
                toast.success("Partner removed");
                const newData = await getPartners();
                setData(newData);
            } catch (error: any) {
                toast.error(error.message);
            }
        });
    };

    if (!data) return <div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    return (
        <div className="space-y-6">
            {/* My Partners Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">My Partners</h2>
                        <p className="text-sm text-muted-foreground">People who have access to your stats.</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-electric hover:bg-electric/90 text-white shadow-electric-sm border-0">
                                <Plus className="h-4 w-4" />
                                Add Partner
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add a Partner</DialogTitle>
                                <DialogDescription>
                                    Search for a user by email to give them access to your workouts.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by email..."
                                        className="pl-9"
                                        value={query}
                                        onChange={onSearchChange}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-3">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {searchResults.map(user => (
                                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.image} />
                                                    <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                disabled={isPending}
                                                onClick={() => handleInvite(user.email)}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    ))}
                                    {query.length >= 3 && !isSearching && searchResults.length === 0 && (
                                        <p className="text-sm text-center text-muted-foreground py-4">No users found.</p>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.myPartners.length === 0 ? (
                        <div className="col-span-full py-8 text-center border rounded-xl border-dashed">
                            <p className="text-muted-foreground">You haven&apos;t added any partners yet.</p>
                        </div>
                    ) : (
                        data.myPartners.map((partner: any) => (
                            <Card key={partner.id} className="overflow-hidden">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={partner.image} />
                                            <AvatarFallback>{partner.name?.[0] || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm">{partner.name}</p>
                                            <p className="text-xs text-muted-foreground">{partner.email}</p>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Remove Partner?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Access will be revoked immediately. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleRemove(partner.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Remove
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Accounts I Manage Section */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold">Accounts You Manage</h2>
                    <p className="text-sm text-muted-foreground">Users who have granted you access.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.accountsIManage.length === 0 ? (
                        <div className="col-span-full py-8 text-center border rounded-xl border-dashed">
                            <p className="text-muted-foreground">No one has granted you access yet.</p>
                        </div>
                    ) : (
                        data.accountsIManage.map((user: any) => (
                            <Link key={user.id} href={`/partners/${user.id}`} className="block group">
                                <Card className="overflow-hidden transition-all duration-300 hover:shadow-electric-sm hover:border-electric/50">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Avatar className="h-12 w-12 border-2 border-border group-hover:border-electric transition-colors">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                                            </Avatar>
                                            <div className="h-8 w-8 rounded-full bg-electric/10 flex items-center justify-center text-electric opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-electric transition-colors">{user.name}</h3>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
