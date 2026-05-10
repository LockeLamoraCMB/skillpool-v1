function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getInitials(name = "ST") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getCutoff(period) {
  const now = new Date();

  if (period === "weekly") {
    now.setDate(now.getDate() - 7);
    return now;
  }

  if (period === "monthly") {
    now.setMonth(now.getMonth() - 1);
    return now;
  }

  return null;
}

function isInPeriod(value, period) {
  const cutoff = getCutoff(period);
  if (!cutoff || !value) return true;
  return new Date(value) >= cutoff;
}

async function safeQuery(label, query) {
  const { data, error } = await query;

  if (error) {
    console.error(`Failed to load leaderboard ${label}`, error);
    return [];
  }

  return data || [];
}

function ensureStats(statsByUser, userId) {
  if (!statsByUser.has(userId)) {
    statsByUser.set(userId, {
      completedRequests: 0,
      averageRating: 0,
      reviewCount: 0,
      ratingTotal: 0,
      replyCount: 0,
      forumPosts: 0,
      badgeCount: 0,
      paidPayments: 0,
      receivedPayments: 0,
      paymentVolume: 0,
      score: 0,
    });
  }

  return statsByUser.get(userId);
}

function mapBadgeDetails(profile) {
  return (profile.user_badges || [])
    .map((item) => item.badges)
    .filter(Boolean)
    .map((badge) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
    }));
}

function mapProfile(profile, stats, rank) {
  const badgeDetails = mapBadgeDetails(profile);
  const fullName = profile.full_name || profile.username || "STI Student";

  return {
    id: profile.id,
    email: profile.email,
    username: profile.username || profile.email?.split("@")[0] || "student",
    fullName,
    avatarUrl: profile.avatar_url,
    initials: getInitials(fullName),
    program: profile.program || profile.role || "STI Student",
    headline: profile.bio || "Skillpool contributor",
    isVerified: Boolean(profile.is_verified),
    badges: badgeDetails.map((badge) => badge.name),
    badgeDetails,
    averageRating: stats.averageRating,
    completedRequests: stats.completedRequests,
    leaderboard: {
      rank,
      score: stats.score,
      averageRating: stats.averageRating,
      completedRequests: stats.completedRequests,
      replyCount: stats.replyCount,
    },
    createdAt: profile.created_at,
  };
}

export function calculateLeaderboardScore(stats) {
  const ratingQuality = Math.round(stats.averageRating * 120);
  const reviewConfidence = stats.reviewCount * 35;
  const completedWork = stats.completedRequests * 90;
  const forumPresence = stats.forumPosts * 18 + stats.replyCount * 10;
  const badges = stats.badgeCount * 55;
  const payments = stats.receivedPayments * 70 + stats.paidPayments * 25;
  const volume = Math.min(Math.round(stats.paymentVolume / 100), 120);

  return ratingQuality + reviewConfidence + completedWork + forumPresence + badges + payments + volume;
}

function rankProfiles({ profiles, statsByUser, search, limit }) {
  const normalizedSearch = (search || "").trim().toLowerCase();

  const ranked = profiles
    .map((profile) => {
      const stats = ensureStats(statsByUser, profile.id);

      if (!stats.score) {
        stats.averageRating = stats.reviewCount
          ? Number((stats.ratingTotal / stats.reviewCount).toFixed(1))
          : safeNumber(stats.averageRating);
        stats.score = calculateLeaderboardScore(stats);
      }

      return { profile, stats };
    })
    .filter(({ profile, stats }) => {
      if (!normalizedSearch) return stats.score > 0 || stats.badgeCount > 0;

      const haystack = [
        profile.full_name,
        profile.username,
        profile.program,
        profile.email,
        ...mapBadgeDetails(profile).map((badge) => badge.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    })
    .sort((a, b) => {
      if (b.stats.score !== a.stats.score) return b.stats.score - a.stats.score;
      if (b.stats.averageRating !== a.stats.averageRating) {
        return b.stats.averageRating - a.stats.averageRating;
      }
      return (a.profile.full_name || "").localeCompare(b.profile.full_name || "");
    })
    .map(({ profile, stats }, index) => ({
      id: `${profile.id}-${index}`,
      userId: profile.id,
      rank: index + 1,
      completedRequests: stats.completedRequests,
      averageRating: stats.averageRating,
      reviewCount: stats.reviewCount,
      replyCount: stats.replyCount,
      forumPosts: stats.forumPosts,
      badgeCount: stats.badgeCount,
      paidPayments: stats.paidPayments,
      receivedPayments: stats.receivedPayments,
      score: stats.score,
      profile: mapProfile(profile, stats, index + 1),
    }));

  return limit ? ranked.slice(0, limit) : ranked;
}

function statsFromRankingRows(rows = []) {
  const statsByUser = new Map();

  for (const row of rows) {
    statsByUser.set(row.user_id, {
      completedRequests: safeNumber(row.completed_requests),
      averageRating: safeNumber(row.average_rating),
      reviewCount: safeNumber(row.review_count),
      ratingTotal: 0,
      replyCount: safeNumber(row.reply_count),
      forumPosts: safeNumber(row.forum_posts),
      badgeCount: safeNumber(row.badge_count),
      paidPayments: safeNumber(row.paid_payments),
      receivedPayments: safeNumber(row.received_payments),
      paymentVolume: safeNumber(row.payment_volume),
      score: safeNumber(row.score),
    });
  }

  return statsByUser;
}

export async function getLeaderboardEntries(supabase, options = {}) {
  const period = options.period || "overall";
  const search = options.search || "";
  const limit = options.limit || null;

  const profiles = await safeQuery(
    "profiles",
    supabase.from("profiles").select(`
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
  );

  const { data: rankingRows, error: rankingError } = await supabase.rpc(
    "get_leaderboard_rankings",
    { leaderboard_period: period }
  );

  if (!rankingError) {
    return rankProfiles({
      profiles,
      statsByUser: statsFromRankingRows(rankingRows || []),
      search,
      limit,
    });
  }

  console.error("Falling back to client-side leaderboard scoring", rankingError);

  const [exchangeReviews, skillExchanges, forumPosts, replies, payments] =
    await Promise.all([
      safeQuery(
        "reviews",
        supabase
          .from("exchange_reviews")
          .select("id, reviewer_id, reviewed_user_id, rating, created_at")
      ),
      safeQuery(
        "exchanges",
        supabase
          .from("skill_exchanges")
          .select("id, requester_id, provider_id, status, completed_at, created_at")
      ),
      safeQuery(
        "forum posts",
        supabase.from("forum_posts").select("id, author_id, created_at")
      ),
      safeQuery(
        "replies",
        supabase.from("replies").select("id, user_id, created_at")
      ),
      safeQuery(
        "payments",
        supabase
          .from("payments")
          .select("id, payer_id, payee_id, amount, status, paid_at, created_at")
      ),
    ]);

  const statsByUser = new Map();

  for (const profile of profiles) {
    const stats = ensureStats(statsByUser, profile.id);
    stats.badgeCount = (profile.user_badges || []).length;
  }

  for (const review of exchangeReviews) {
    if (!review.reviewed_user_id || !isInPeriod(review.created_at, period)) continue;
    const stats = ensureStats(statsByUser, review.reviewed_user_id);
    stats.reviewCount += 1;
    stats.ratingTotal += safeNumber(review.rating);
  }

  for (const exchange of skillExchanges) {
    if (
      exchange.status !== "completed" ||
      !isInPeriod(exchange.completed_at || exchange.created_at, period)
    ) {
      continue;
    }

    if (exchange.provider_id) {
      ensureStats(statsByUser, exchange.provider_id).completedRequests += 1;
    }

    if (exchange.requester_id && exchange.requester_id !== exchange.provider_id) {
      ensureStats(statsByUser, exchange.requester_id).completedRequests += 1;
    }
  }

  for (const post of forumPosts) {
    if (!post.author_id || !isInPeriod(post.created_at, period)) continue;
    ensureStats(statsByUser, post.author_id).forumPosts += 1;
  }

  for (const reply of replies) {
    if (!reply.user_id || !isInPeriod(reply.created_at, period)) continue;
    ensureStats(statsByUser, reply.user_id).replyCount += 1;
  }

  for (const payment of payments) {
    if (payment.status !== "paid" || !isInPeriod(payment.paid_at || payment.created_at, period)) {
      continue;
    }

    if (payment.payer_id) {
      ensureStats(statsByUser, payment.payer_id).paidPayments += 1;
    }

    if (payment.payee_id) {
      const payeeStats = ensureStats(statsByUser, payment.payee_id);
      payeeStats.receivedPayments += 1;
      payeeStats.paymentVolume += safeNumber(payment.amount);
    }
  }

  return rankProfiles({ profiles, statsByUser, search, limit });
}
