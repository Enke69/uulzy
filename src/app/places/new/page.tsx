import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { PlaceForm } from "@/components/PlaceForm";

export default async function NewPlacePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <div className="pt-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-1">Suggest a place</h1>
      <p className="text-ink-soft mb-6">
        An admin will review it before it appears publicly. Approved suggestions
        earn you points!
      </p>
      <PlaceForm />
    </div>
  );
}
