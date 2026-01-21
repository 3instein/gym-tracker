"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchUsers(query: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!query || query.length < 3) return [];

    const users = await prisma.user.findMany({
        where: {
            email: {
                contains: query,
                mode: "insensitive",
            },
            id: {
                not: session.user.id, // Exclude self
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
        take: 5,
    });

    return users;
}

export async function invitePartner(email: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const partnerUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!partnerUser) {
        throw new Error("User not found");
    }

    if (partnerUser.id === session.user.id) {
        throw new Error("Cannot add yourself as a partner");
    }

    // Check if persistence already exists
    const existing = await prisma.partner.findUnique({
        where: {
            userId_partnerId: {
                userId: session.user.id,
                partnerId: partnerUser.id,
            },
        },
    });

    if (existing) {
        throw new Error("User is already a partner");
    }

    await prisma.partner.create({
        data: {
            userId: session.user.id,
            partnerId: partnerUser.id,
        },
    });

    revalidatePath("/partners");
}

export async function removePartner(partnerId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // We start by finding the record to ensure we are only deleting records where the current user is the owner (userId)
    // The `partnerId` passed here is the ID of the User we want to remove, not the ID of the Partner record
    // Wait, the UI might pass the User ID of the partner to remove.
    // Let's assume partnerId is the User ID of the partner.

    await prisma.partner.delete({
        where: {
            userId_partnerId: {
                userId: session.user.id,
                partnerId: partnerId
            }
        },
    });

    revalidatePath("/partners");
}

export async function getPartners() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // People I have given access to (My Partners)
    const myPartners = await prisma.partner.findMany({
        where: { userId: session.user.id },
        include: {
            partner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    // People who check on me (I am a partner of them) -> Accounts I Manage
    // In this relationship, they are the 'userId' (owner) and I am the 'partnerId' (viewer)
    const accountsIManage = await prisma.partner.findMany({
        where: { partnerId: session.user.id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    return {
        myPartners: myPartners.map((p: any) => p.partner),
        accountsIManage: accountsIManage.map((p: any) => p.user),
    };
}

export async function checkPartnerAccess(targetUserId: string) {
    const session = await auth();
    if (!session?.user?.id) return false;

    // If checking self, allow
    if (targetUserId === session.user.id) return true;

    // Check if I (session.user.id) am a partner of targetUserId
    // This means targetUserId has a Partner record where partnerId is me
    const access = await prisma.partner.findUnique({
        where: {
            userId_partnerId: {
                userId: targetUserId,
                partnerId: session.user.id,
            },
        },
    });

    return !!access;
}
