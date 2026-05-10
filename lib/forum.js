export const POST_TYPE_OPTIONS = [
  { value: "offer", label: "Offer a Skill" },
  { value: "need_help", label: "Need Help" },
];

export const LAST_UPDATED_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This week" },
  { value: "this_month", label: "This month" },
];

export const SORT_BY_OPTIONS = [
  { value: "last_updated", label: "Last updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "relevant", label: "Most relevant" },
];

export const SORT_DIRECTION_OPTIONS = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

function getSearchValue(raw, key) {
  const value = raw?.[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function makeForumSlug(title = "") {
  const base = slugify(title) || "post";
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${base}-${unique}`;
}

export function parseTags(raw = "") {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 8);
}

export function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function excerptFromHtml(html = "", maxLength = 180) {
  const plain = stripHtml(html);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}…`;
}

export function formatForumDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function normalizeForumFilters(raw = {}) {
  return {
    program: getSearchValue(raw, "program"),
    course: getSearchValue(raw, "course"),
    postType: getSearchValue(raw, "postType"),
    startedBy: getSearchValue(raw, "startedBy").trim(),
    lastUpdated: getSearchValue(raw, "lastUpdated") || "any",
    sortBy: getSearchValue(raw, "sortBy") || "last_updated",
    sortDirection: getSearchValue(raw, "sortDirection") === "asc" ? "asc" : "desc",
    featured:
      ["1", "true", "on"].includes(getSearchValue(raw, "featured").toLowerCase()),
  };
}

export function getUpdatedAfterIso(value) {
  if (!value || value === "any") return null;

  const now = new Date();

  if (value === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }

  if (value === "this_week") {
    now.setDate(now.getDate() - 7);
    return now.toISOString();
  }

  if (value === "this_month") {
    now.setMonth(now.getMonth() - 1);
    return now.toISOString();
  }

  return null;
}

export function applyPostFeedFilters(query, filters, locked = {}) {
  let nextQuery = query;

  const programSlug = locked.programSlug || filters.program;
  const courseSlug = locked.courseSlug || filters.course;

  if (programSlug) {
    nextQuery = nextQuery.eq("program_slug", programSlug);
  }

  if (courseSlug) {
    nextQuery = nextQuery.eq("course_slug", courseSlug);
  }

  if (filters.postType) {
    nextQuery = nextQuery.eq("post_type", filters.postType);
  }

  if (filters.featured) {
    nextQuery = nextQuery.eq("is_featured", true);
  }

  if (filters.startedBy) {
    const cleaned = filters.startedBy.replace(/[%(),]/g, "").trim();
    if (cleaned) {
      nextQuery = nextQuery.or(
        `author_username.ilike.%${cleaned}%,author_full_name.ilike.%${cleaned}%`
      );
    }
  }

  const cutoff = getUpdatedAfterIso(filters.lastUpdated);
  if (cutoff) {
    nextQuery = nextQuery.gte("updated_at", cutoff);
  }

  if (filters.sortBy === "relevant") {
    nextQuery = nextQuery
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false });
    return nextQuery;
  }

  if (filters.sortBy === "oldest") {
    return nextQuery.order("created_at", { ascending: true });
  }

  if (filters.sortBy === "newest") {
    return nextQuery.order("created_at", {
      ascending: filters.sortDirection === "asc",
    });
  }

  return nextQuery.order("updated_at", {
    ascending: filters.sortDirection === "asc",
  });
}

export async function getForumTaxonomy(supabase) {
  const [{ data: programs, error: programsError }, { data: courses, error: coursesError }] =
    await Promise.all([
      supabase
        .from("programs")
        .select("id, name, slug, description, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("courses")
        .select("id, program_id, code, name, slug, description, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ]);

  if (programsError) throw programsError;
  if (coursesError) throw coursesError;

  const programMap = new Map((programs || []).map((program) => [program.id, program]));

  const enrichedCourses = (courses || []).map((course) => ({
    ...course,
    program_slug: programMap.get(course.program_id)?.slug || "",
    program_name: programMap.get(course.program_id)?.name || "",
  }));

  return {
    programs: programs || [],
    courses: enrichedCourses,
  };
}