"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LAST_UPDATED_OPTIONS,
  POST_TYPE_OPTIONS,
  SORT_BY_OPTIONS,
  SORT_DIRECTION_OPTIONS,
} from "@/lib/forum";

export default function ForumFilterPanel({
  programs = [],
  courses = [],
  filters,
  lockedProgramSlug = "",
  lockedCourseSlug = "",
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [form, setForm] = useState({
    program: lockedProgramSlug || filters.program || "",
    course: lockedCourseSlug || filters.course || "",
    postType: filters.postType || "",
    startedBy: filters.startedBy || "",
    lastUpdated: filters.lastUpdated || "any",
    sortBy: filters.sortBy || "last_updated",
    sortDirection: filters.sortDirection || "desc",
    featured: Boolean(filters.featured),
  });

  const availableCourses = useMemo(() => {
    const selectedProgram = lockedProgramSlug || form.program;
    return selectedProgram
      ? courses.filter((course) => course.program_slug === selectedProgram)
      : courses;
  }, [courses, form.program, lockedProgramSlug]);

  function updateField(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "program" && !lockedProgramSlug) {
        next.course = "";
      }

      return next;
    });
  }

  function applyFilters(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (!lockedProgramSlug && form.program) params.set("program", form.program);
    if (!lockedCourseSlug && form.course) params.set("course", form.course);
    if (form.postType) params.set("postType", form.postType);
    if (form.startedBy) params.set("startedBy", form.startedBy);
    if (form.lastUpdated && form.lastUpdated !== "any") params.set("lastUpdated", form.lastUpdated);
    if (form.sortBy && form.sortBy !== "last_updated") params.set("sortBy", form.sortBy);
    if (form.sortDirection && form.sortDirection !== "desc") params.set("sortDirection", form.sortDirection);
    if (form.featured) params.set("featured", "1");

    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <aside className="rounded-[24px] border border-[#D9E2E8] bg-white p-5 shadow-[0_12px_35px_rgba(23,43,58,0.06)]">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7B8794]">
        Filter posts
      </p>

      <form onSubmit={applyFilters} className="mt-5 space-y-5">
        <label className="flex items-center gap-3 text-sm font-semibold text-[#12212B]">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="h-4 w-4 rounded border-[#CBD5E1]"
          />
          Featured threads
        </label>

        {!lockedProgramSlug ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#31424F]">
              Program
            </label>
            <select
              value={form.program}
              onChange={(e) => updateField("program", e.target.value)}
              className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            >
              <option value="">(Any)</option>
              {programs.map((program) => (
                <option key={program.id} value={program.slug}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#31424F]">
              Program
            </label>
            <div className="rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 text-sm font-semibold text-[#52606D]">
              {lockedProgramSlug}
            </div>
          </div>
        )}

        {!lockedCourseSlug ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#31424F]">
              Course
            </label>
            <select
              value={form.course}
              onChange={(e) => updateField("course", e.target.value)}
              className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            >
              <option value="">(Any)</option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.slug}>
                  {course.code ? `${course.code} — ` : ""}
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#31424F]">
              Course
            </label>
            <div className="rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 text-sm font-semibold text-[#52606D]">
              {lockedCourseSlug}
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#31424F]">
            Started by
          </label>
          <input
            value={form.startedBy}
            onChange={(e) => updateField("startedBy", e.target.value)}
            className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            placeholder="Username or full name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#31424F]">
            Last updated
          </label>
          <select
            value={form.lastUpdated}
            onChange={(e) => updateField("lastUpdated", e.target.value)}
            className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
          >
            {LAST_UPDATED_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#31424F]">
            Thread type
          </label>
          <select
            value={form.postType}
            onChange={(e) => updateField("postType", e.target.value)}
            className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
          >
            <option value="">(Any)</option>
            {POST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#31424F]">
              Sort by
            </label>
            <select
              value={form.sortBy}
              onChange={(e) => updateField("sortBy", e.target.value)}
              className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            >
              {SORT_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#31424F]">
              Direction
            </label>
            <select
              value={form.sortDirection}
              onChange={(e) => updateField("sortDirection", e.target.value)}
              className="w-full rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 outline-none focus:border-[#7EA9B9]"
            >
              {SORT_DIRECTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 rounded-2xl bg-[#12212B] px-4 py-3 text-sm font-semibold text-white"
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-2xl border border-[#D3DDE5] bg-[#F9FBFC] px-4 py-3 text-sm font-semibold text-[#12212B]"
          >
            Reset
          </button>
        </div>
      </form>
    </aside>
  );
}