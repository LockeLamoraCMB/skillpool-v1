import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/messages";
import ConversationView from "@/components/messages/ConversationView";

export default async function ConversationPage({ params }) {
  const { userId } = await params;

  if (!isUuid(userId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/join?next=/messages/${userId}`);
  }

  if (user.id === userId) {
    redirect("/messages");
  }

  const { data: targetProfile, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role, program")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!targetProfile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px]">
        <ConversationView currentUserId={user.id} targetProfile={targetProfile} />
      </div>
    </main>
  );
}
