import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MessagesInbox from "@/components/messages/MessagesInbox";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/join?next=/messages");
  }

  return (
    <main className="min-h-screen bg-[#EFF3F5] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px]">
        <MessagesInbox currentUserId={user.id} />
      </div>
    </main>
  );
}
