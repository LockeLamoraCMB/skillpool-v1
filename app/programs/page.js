import ProgramCard from "@/components/ProgramCard";
import SectionHeading from "@/components/SectionHeading";
import { fetchProgramsWithCourses } from "@/lib/supabaseData";

export const metadata = {
  title: "Programs",
};

export default async function ProgramsPage() {
  const programs = await fetchProgramsWithCourses();

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="section-card hero-noise p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Programs</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#000100] sm:text-5xl">
          Program hubs and course-based forum spaces
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-black/68 sm:text-lg">
          This scaffold page organizes Skillpool around the main STI College Carmona programs
          so listings can feel local, relevant, and easy to browse.
        </p>
      </div>

      <div className="py-8 sm:py-12">
        <SectionHeading
          eyebrow="Program overview"
          title="Browse the main communities inside Skillpool"
          description="Each program gets its own course-focused subforums and listing flow, making discovery easier for both tutors and clients."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {programs.length ? (
            programs.map((program) => <ProgramCard key={program.id} program={program} />)
          ) : (
            <div className="section-card p-6 text-sm text-black/60 lg:col-span-2 xl:col-span-3">
              No programs found yet. Add rows to the programs and courses tables in Supabase.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
