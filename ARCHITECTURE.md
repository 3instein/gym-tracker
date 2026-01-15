# Full-Stack Next.js Architecture Reference

A reference template for building full-stack applications with Next.js App Router, Prisma, and NextAuth.

---

## Tech Stack Overview

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| **Framework**    | Next.js 16 (App Router)                          |
| **Language**     | TypeScript 5                                     |
| **Database**     | PostgreSQL (Supabase)                            |
| **ORM**          | Prisma 7 with `@prisma/adapter-pg`               |
| **Auth**         | NextAuth v5 (Auth.js) with `@auth/prisma-adapter`|
| **Styling**      | Tailwind CSS 4 + shadcn/ui (Radix primitives)    |
| **Forms**        | React Hook Form + Zod v4 validation              |
| **Charts**       | Recharts                                         |
| **State**        | React Server Components + Server Actions         |

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group (public)
│   ├── (dashboard)/        # Protected routes
│   │   ├── feature-a/
│   │   ├── feature-b/
│   │   └── settings/
│   ├── api/                # API routes (NextAuth handlers)
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── feature-a/          # Feature-specific components
│   ├── feature-b/
│   └── shared/
├── lib/
│   ├── actions/            # Server Actions (data mutations)
│   ├── validations/        # Zod schemas
│   ├── auth.ts             # NextAuth configuration
│   ├── prisma.ts           # Prisma client singleton
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeding
├── types/                  # TypeScript type definitions
└── middleware.ts           # Auth middleware
```

---

## Database Architecture

### ORM Setup (Prisma 7)

Using Prisma with the PostgreSQL adapter for connection pooling:

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const pool = globalForPrisma.pool ?? new Pool({
  connectionString: process.env.DIRECT_URL,
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" 
      ? ["query", "error", "warn"] 
      : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
```

### Schema Template

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// NextAuth.js Models (required)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  // Add your domain relations here
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Domain Models - Example patterns
model Item {
  id        String   @id @default(cuid())
  userId    String
  name      String
  amount    Decimal  @db.Decimal(15, 2)  // For monetary values
  status    Status   @default(ACTIVE)
  metadata  Json?                        // For flexible JSON data
  date      DateTime @db.Date            // Date-only storage
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([date])
}

enum Status {
  ACTIVE
  COMPLETED
  CANCELLED
}
```

### Database Scripts

```json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate"
  }
}
```

---

## Authentication

Using NextAuth v5 (Auth.js) with database sessions:

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  trustHost: true,
});
```

### Middleware (Route Protection)

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionToken;
  const isOnLoginPage = pathname === "/login";
  const isPublicRoute = pathname.startsWith("/public");

  if (isOnLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!isLoggedIn && !isOnLoginPage && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"
};
```

---

## Server Actions Pattern

All data mutations use Next.js Server Actions with a consistent pattern:

```typescript
// lib/actions/items.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { itemSchema, ItemInput } from "@/lib/validations/item";

export async function getItems() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createItem(data: ItemInput) {
  // 1. Auth check
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 2. Validate input with Zod
  const validated = itemSchema.parse(data);

  // 3. Database operation
  const item = await prisma.item.create({
    data: { ...validated, userId: session.user.id },
  });

  // 4. Revalidate affected paths
  revalidatePath("/");
  revalidatePath("/items");
  return item;
}

export async function updateItem(id: string, data: ItemInput) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = itemSchema.parse(data);

  const item = await prisma.item.update({
    where: { id, userId: session.user.id },
    data: validated,
  });

  revalidatePath("/");
  revalidatePath("/items");
  return item;
}

export async function deleteItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.item.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/");
  revalidatePath("/items");
}
```

---

## Form Validation (Zod v4)

```typescript
// lib/validations/item.ts
import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]),
  description: z.string().optional(),
  date: z.string(),
});

export type ItemInput = z.infer<typeof itemSchema>;
```

Integration with React Hook Form:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, ItemInput } from "@/lib/validations/item";

const form = useForm<ItemInput>({
  resolver: zodResolver(itemSchema),
  defaultValues: {
    name: "",
    amount: 0,
    status: "ACTIVE",
  },
});
```

---

## UI Components (shadcn/ui)

Component library built on Radix UI primitives with Tailwind CSS.

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog form input select
```

**Pattern:** Feature-specific components compose UI primitives:
```
components/
├── ui/                  # Base shadcn/ui components
├── feature-a/
│   ├── item-form.tsx
│   ├── item-list.tsx
│   └── item-card.tsx
└── shared/
    └── loading-skeleton.tsx
```

---

## Environment Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."     # Pooled connection
DIRECT_URL="postgresql://..."       # Direct connection (for Prisma)

# NextAuth
AUTH_SECRET="..."                   # Generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

---

## Key Patterns

### 1. Server/Client Component Split
- **Server Components**: Data fetching, async operations (default)
- **Client Components**: Interactivity, forms, charts (marked with `"use client"`)

### 2. Route Groups
- `(auth)`: Public auth pages
- `(dashboard)`: Protected routes with shared layout

### 3. Decimal Handling
Using `Decimal` type for monetary/precise values. Convert to `Number()` when passing to client components.

### 4. Date-Only Storage
```typescript
// Avoid timezone issues when storing dates
const date = new Date(validated.date);
const dateOnly = new Date(Date.UTC(
  date.getFullYear(), 
  date.getMonth(), 
  date.getDate()
));
```

### 5. Prisma Transactions
```typescript
await prisma.$transaction([
  prisma.item.update({ where: { id: item1Id }, data: { ... } }),
  prisma.item.update({ where: { id: item2Id }, data: { ... } }),
]);
```

---

## Commands Reference

```bash
# Development
npm run dev          # Start dev server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Build & Deploy
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

---

## Dependencies

```json
{
  "dependencies": {
    "@auth/prisma-adapter": "^2.11.1",
    "@hookform/resolvers": "^5.2.2",
    "@prisma/adapter-pg": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "next": "16.1.1",
    "next-auth": "^5.0.0-beta.30",
    "pg": "^8.16.3",
    "prisma": "^7.2.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.69.0",
    "zod": "^4.3.4"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```
