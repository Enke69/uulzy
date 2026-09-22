import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

export async function Navbar() {
  const user = await getSessionUser();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-black/5">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-5">
        <Link href="/" className="font-display text-2xl text-primary shrink-0">
          Uulzy
        </Link>
        <div className="hidden sm:flex items-center gap-1 text-sm font-medium">
          <Link href="/places" className="btn btn-ghost">
            Places
          </Link>
          <Link href="/templates" className="btn btn-ghost">
            Plans
          </Link>
          <Link href="/meetups" className="btn btn-ghost">
            Meetups
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="btn btn-ghost text-warning">
              Admin
            </Link>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile" className="btn btn-ghost">
                <span
                  aria-hidden
                  className="w-7 h-7 rounded-full bg-primary-soft text-primary grid place-items-center text-xs font-bold"
                >
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="sm:hidden border-t border-black/5 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-4 text-sm font-medium overflow-x-auto">
          <Link href="/places">Places</Link>
          <Link href="/templates">Plans</Link>
          <Link href="/meetups">Meetups</Link>
          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
        </div>
      </div>
    </header>
  );
}
