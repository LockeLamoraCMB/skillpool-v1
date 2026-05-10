import Image from "next/image";
import Link from "next/link";
import { fetchProgramsWithCourses } from "@/lib/supabaseData";
import { siteLinks } from "@/lib/siteData";

export default async function Footer() {
  const programs = await fetchProgramsWithCourses();

  return (
    <footer className="border-t border-black/6 bg-white/80">
      <div className="page-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-start">
              <div className="flex flex-col items-start">
                <Image
                  src="/logo.png"
                  alt="Skillpool logo"
                  width={170}
                  height={48}
                  className="h-auto w-[170px] object-contain"
                  priority
                />
                <p className="mt-1 text-[13px] leading-none text-black/55">
                  Share a skill. Make it real.
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-black/65">
              A student-only skill-sharing marketplace and community hub for STI College Carmona.
              Built to make tutoring, collaboration, and campus freelancing easier to discover.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-black/45">
              Navigate
            </h3>
            <ul className="mt-4 space-y-3">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-black/70 transition hover:text-[#000100]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-black/45">
              Featured Programs
            </h3>
            <ul className="mt-4 space-y-3">
              {programs.length ? (
                programs.map((program) => (
                  <li key={program.id} className="text-sm text-black/70">
                    {program.name}
                  </li>
                ))
              ) : (
                <li className="text-sm text-black/55">
                  Add programs in Supabase to show them here.
                </li>
              )}
            </ul>
          </div>
        </div>

        
      </div>
    </footer>
  );
}
