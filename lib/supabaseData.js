import { getSupabaseClient } from "@/lib/supabase";
import { getLeaderboardEntries } from "@/lib/leaderboard";

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getInitials(name = "Skillpool") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) {
    return "₱0";
  }

  if (Number.isInteger(amount)) {
    return `₱${amount}`;
  }

  return `₱${amount.toFixed(2)}`;
}

function formatPriceLabel(price) {
  return `${formatCurrency(price)} ${Number(price || 0) > 0 ? "fixed" : "starting"}`;
}

function timeAgo(dateString) {
  if (!dateString) return "Recently posted";

  const now = Date.now();
  const then = new Date(dateString).getTime();
  const minutes = Math.max(1, Math.round((now - then) / 60000));

  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return new Date(dateString).toLocaleDateString();
}

function averageRating(items = []) {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
  return Number((total / items.length).toFixed(1));
}

function mapProgram(program) {
  return {
    id: program.id,
    name: program.name,
    slug: program.slug,
    description: program.description || `Community hub for ${program.name} students.`,
    shortDescription: program.description || `Browse listings and course forums for ${program.name}.`,
    courses: (program.courses || [])
      .map((course) => ({
        id: course.id,
        name: course.name,
        slug: course.slug,
        description: course.description || `${course.name} discussions and service requests.`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

function mapProfile(profile, extras = {}) {
  const badges = (profile.user_badges || []).map((item) => item.badges).filter(Boolean);
  const reviews = extras.reviews || [];
  const leaderboard = extras.leaderboard || null;

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    initials: getInitials(profile.full_name),
    program: profile.program || "Program not set",
    programSlug: slugify(profile.program || "unknown"),
    yearLevel: extras.yearLevel || "STI Student",
    bio: profile.bio || "This student has not added a profile bio yet.",
    headline: extras.headline || "Active Skillpool member",
    isVerified: Boolean(profile.is_verified),
    badges: badges.map((badge) => badge.name),
    badgeDetails: badges,
    averageRating: leaderboard?.average_rating ?? averageRating(reviews),
    completedRequests: leaderboard?.completed_requests ?? extras.completedRequests ?? 0,
    responseTime: extras.responseTime || "Response time not available yet",
    preferredMeetup: extras.preferredMeetup || "Flexible",
    leaderboard: leaderboard
      ? {
          rank: extras.rank || null,
          score: leaderboard.score,
          averageRating: leaderboard.average_rating,
          completedRequests: leaderboard.completed_requests,
          replyCount: leaderboard.reply_count,
        }
      : null,
    createdAt: profile.created_at,
  };
}

function mapListing(listing) {
  const replies = listing.replies || [];
  const reviews = listing.reviews || [];
  const poster = listing.profiles ? mapProfile(listing.profiles, { reviews }) : null;

  return {
    id: listing.id,
    userId: listing.user_id,
    title: listing.title,
    description: listing.description,
    fullDescription: listing.description,
    roleType: listing.role_type,
    meetupOption: listing.meetup_option,
    status: listing.status,
    createdAt: listing.created_at,
    postedLabel: timeAgo(listing.created_at),
    postedMinutesAgo: Math.max(1, Math.round((Date.now() - new Date(listing.created_at).getTime()) / 60000)),
    price: Number(listing.price || 0),
    priceLabel: formatPriceLabel(listing.price),
    rating: averageRating(reviews),
    reviewCount: reviews.length,
    replyCount: replies.length,
    views: replies.length * 9 + reviews.length * 15 + 20,
    isPinned: replies.length >= 2 || Number(listing.price || 0) >= 400,
    tags: [listing.role_type, listing.meetup_option, listing.status].filter(Boolean),
    program: listing.programs
      ? {
          id: listing.programs.id,
          name: listing.programs.name,
          slug: listing.programs.slug,
        }
      : null,
    programSlug: listing.programs?.slug || "unknown",
    course: listing.courses
      ? {
          id: listing.courses.id,
          name: listing.courses.name,
          slug: listing.courses.slug,
        }
      : null,
    courseName: listing.courses?.name || "General",
    poster,
    replies: replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.created_at,
      createdAtLabel: timeAgo(reply.created_at),
      userId: reply.user_id,
      user: reply.profiles
        ? mapProfile(reply.profiles)
        : {
            id: reply.user_id,
            fullName: "Student",
            username: "student",
            initials: "ST",
            isVerified: false,
          },
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: Number(review.rating || 0),
      comment: review.comment || "No written review.",
      createdAt: review.created_at,
      createdAtLabel: timeAgo(review.created_at),
      reviewerId: review.reviewer_id,
      reviewer: review.reviewer
        ? mapProfile(review.reviewer)
        : {
            id: review.reviewer_id,
            fullName: "Student reviewer",
            username: "reviewer",
            initials: "SR",
          },
    })),
  };
}

function emptyData() {
  return {
    programs: [],
    courseForums: [],
    listings: [],
    leaderboardStats: [],
    badges: [],
    profiles: [],
  };
}

export async function fetchProgramsWithCourses() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("programs")
    .select(`
      id,
      name,
      slug,
      description,
      courses (
        id,
        name,
        slug,
        description
      )
    `)
    .order("name", { ascending: true })
    .order("name", { foreignTable: "courses", ascending: true });

  if (error) {
    console.error("Failed to fetch programs", error);
    return [];
  }

  return (data || []).map(mapProgram);
}

export async function fetchLeaderboardStats(limit) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  return getLeaderboardEntries(supabase, { limit });
}

export async function fetchBadgesSummary() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_badges")
    .select(`
      badge_id,
      badges (
        id,
        name,
        description,
        icon,
        color
      )
    `);

  if (error) {
    console.error("Failed to fetch badge summary", error);
    return [];
  }

  const counts = new Map();
  for (const item of data || []) {
    const badge = item.badges;
    if (!badge) continue;
    const current = counts.get(badge.id) || { ...badge, count: 0 };
    current.count += 1;
    counts.set(badge.id, current);
  }

  return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 5);
}

export async function fetchListings(limit) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("listings")
    .select(`
      id,
      user_id,
      role_type,
      title,
      description,
      price,
      meetup_option,
      status,
      created_at,
      programs:program_id (
        id,
        name,
        slug
      ),
      courses:course_id (
        id,
        name,
        slug,
        description
      ),
      profiles:user_id (
        id,
        email,
        full_name,
        username,
        avatar_url,
        program,
        bio,
        is_verified,
        created_at,
        user_badges (
          badges (
            id,
            name,
            description,
            icon,
            color
          )
        )
      ),
      replies (
        id,
        user_id,
        content,
        created_at,
        profiles:user_id (
          id,
          email,
          full_name,
          username,
          avatar_url,
          program,
          bio,
          is_verified,
          created_at
        )
      ),
      reviews (
        id,
        reviewer_id,
        reviewee_id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id (
          id,
          email,
          full_name,
          username,
          avatar_url,
          program,
          bio,
          is_verified,
          created_at
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch listings", error);
    return [];
  }

  return (data || []).map(mapListing);
}

export async function fetchListingById(id) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      user_id,
      role_type,
      title,
      description,
      price,
      meetup_option,
      status,
      created_at,
      programs:program_id (
        id,
        name,
        slug
      ),
      courses:course_id (
        id,
        name,
        slug,
        description
      ),
      profiles:user_id (
        id,
        email,
        full_name,
        username,
        avatar_url,
        program,
        bio,
        is_verified,
        created_at,
        user_badges (
          badges (
            id,
            name,
            description,
            icon,
            color
          )
        )
      ),
      replies (
        id,
        user_id,
        content,
        created_at,
        profiles:user_id (
          id,
          email,
          full_name,
          username,
          avatar_url,
          program,
          bio,
          is_verified,
          created_at,
          user_badges (
            badges (
              id,
              name,
              description,
              icon,
              color
            )
          )
        )
      ),
      reviews (
        id,
        reviewer_id,
        reviewee_id,
        rating,
        comment,
        created_at,
        reviewer:reviewer_id (
          id,
          email,
          full_name,
          username,
          avatar_url,
          program,
          bio,
          is_verified,
          created_at
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch listing by id", error);
    return null;
  }

  return mapListing(data);
}

export async function fetchProfileByUsername(username) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      username,
      avatar_url,
      program,
      bio,
      is_verified,
      created_at,
      user_badges (
        badges (
          id,
          name,
          description,
          icon,
          color
        )
      )
    `)
    .eq("username", username)
    .single();

  if (error || !profile) {
    if (error) console.error("Failed to fetch profile", error);
    return null;
  }

  const [leaderboardEntries, listings, reviews] = await Promise.all([
    fetchLeaderboardStats(),
    fetchListings(),
    fetchReviewsForUser(profile.id),
  ]);

  const leaderboard = leaderboardEntries.find((entry) => entry.userId === profile.id) || null;
  const mappedProfile = mapProfile(profile, {
    reviews,
    leaderboard: leaderboard
      ? {
          completed_requests: leaderboard.completedRequests,
          average_rating: leaderboard.averageRating,
          reply_count: leaderboard.replyCount,
          score: leaderboard.score,
        }
      : null,
    rank: leaderboard?.rank,
    completedRequests: leaderboard?.completedRequests,
  });

  return {
    profile: mappedProfile,
    listings: listings.filter((item) => item.userId === profile.id),
    reviews,
    leaderboard,
  };
}

export async function fetchReviewsForUser(userId) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id,
      reviewer_id,
      reviewee_id,
      rating,
      comment,
      created_at,
      reviewer:reviewer_id (
        id,
        email,
        full_name,
        username,
        avatar_url,
        program,
        bio,
        is_verified,
        created_at
      )
    `)
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews for user", error);
    return [];
  }

  return (data || []).map((review) => ({
    id: review.id,
    rating: Number(review.rating || 0),
    comment: review.comment || "No written review.",
    createdAt: review.created_at,
    createdAtLabel: timeAgo(review.created_at),
    reviewerId: review.reviewer_id,
    reviewer: review.reviewer ? mapProfile(review.reviewer) : null,
  }));
}

export async function fetchForumData() {
  const [programs, listings, leaderboardStats, badges] = await Promise.all([
    fetchProgramsWithCourses(),
    fetchListings(),
    fetchLeaderboardStats(4),
    fetchBadgesSummary(),
  ]);

  const courseForums = programs.flatMap((program) =>
    (program.courses || []).map((course) => ({
      id: `${program.slug}-${course.slug}`,
      programSlug: program.slug,
      programName: program.name,
      courseName: course.name,
      courseSlug: course.slug,
      description: course.description,
    }))
  );

  const trendingDiscussions = listings.slice(0, 4).map((listing) => ({
    id: listing.id,
    title: listing.title,
    replies: listing.replyCount,
    programSlug: listing.programSlug,
  }));

  const latestActivity = listings.slice(0, 4).map((listing) => ({
    id: `${listing.id}-activity`,
    text: `${listing.poster?.fullName || "A student"} posted “${listing.title}”.`,
    time: listing.postedLabel,
  }));

  return {
    programs,
    listings,
    leaderboardStats,
    badges,
    courseForums,
    trendingDiscussions,
    latestActivity,
  };
}

export async function fetchHomePageData() {
  const [programs, listings, leaderboardStats] = await Promise.all([
    fetchProgramsWithCourses(),
    fetchListings(4),
    fetchLeaderboardStats(3),
  ]);

  const communityStats = [
    { label: "Live programs", value: `${programs.length}` },
    { label: "Open listings", value: `${listings.filter((item) => item.status !== "Completed").length}` },
    { label: "Replies", value: `${listings.reduce((sum, item) => sum + item.replyCount, 0)}` },
    { label: "Top tutors", value: `${leaderboardStats.length}` },
  ];

  return {
    programs,
    listings,
    leaderboardStats,
    communityStats,
  };
}
