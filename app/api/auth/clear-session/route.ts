import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
    const cookieStore = await cookies();
    cookieStore.delete("authjs.session-token");
    cookieStore.delete("__Secure-authjs.session-token");

    redirect("/login");
}
