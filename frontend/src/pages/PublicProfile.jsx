import { useEffect, useMemo, useState } from "react";

import {
  ExternalLink,
  Users,
  Star,
  GitFork,
  BookOpen,
  Code2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  CircleUserRound,
  RefreshCw,
} from "lucide-react";

const API = "http://localhost:5000/api";

// ============================================================
// SMALL COMPONENTS
// ============================================================

function SectionTitle({
  icon: Icon,
  title,
  description,
}) {
  const SafeIcon = Icon || Code2;

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
          <SafeIcon className="h-4 w-4 text-slate-300" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">
            {title}
          </h2>

          {description && (
            <p className="text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  const SafeIcon = Icon || Code2;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <SafeIcon className="h-4 w-4" />

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xl font-bold text-white">
        {value ?? 0}
      </p>
    </div>
  );
}

// ============================================================
// LOADING CARD
// ============================================================

function LoadingCard({
  text = "Loading...",
}) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-sm text-slate-400">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {text}
    </div>
  );
}

// ============================================================
// ERROR CARD
// ============================================================

function ErrorCard({
  text,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
      <AlertCircle className="h-5 w-5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

// ============================================================
// ACTIVITY GRAPH
// ============================================================

function ActivityGraph({
  data = [],
}) {
  const normalized = Array.isArray(data)
    ? data
    : [];

  if (!normalized.length) {
    return (
      <div className="flex h-28 items-center justify-center rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-500">
        No contribution data available
      </div>
    );
  }

  const getLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  const levelClasses = {
    0: "bg-slate-800",
    1: "bg-emerald-950",
    2: "bg-emerald-800",
    3: "bg-emerald-600",
    4: "bg-emerald-400",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div
        className="grid grid-flow-col grid-rows-7 gap-1"
        style={{
          gridAutoColumns: "12px",
          width: "max-content",
        }}
      >
        {normalized.map((day, index) => {
          const count = Number(
            day?.count || 0
          );

          const level = getLevel(count);

          return (
            <div
              key={`${day?.date || "day"}-${index}`}
              title={`${day?.date || ""}: ${count} contributions`}
              className={`h-3 w-3 rounded-sm ${levelClasses[level]}`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-slate-500">
        <span>Less</span>

        <span className="h-3 w-3 rounded-sm bg-slate-800" />
        <span className="h-3 w-3 rounded-sm bg-emerald-950" />
        <span className="h-3 w-3 rounded-sm bg-emerald-800" />
        <span className="h-3 w-3 rounded-sm bg-emerald-600" />
        <span className="h-3 w-3 rounded-sm bg-emerald-400" />

        <span>More</span>
      </div>
    </div>
  );
}

// ============================================================
// GITHUB SECTION
// ============================================================

function GitHubSection({
  github,
  repositories,
  contributions,
  loading,
  error,
}) {
  // Loading
  if (loading) {
    return (
      <section>
        <SectionTitle
          icon={Code2}
          title="GitHub"
          description="Developer activity"
        />

        <LoadingCard text="Checking GitHub..." />
      </section>
    );
  }

  // Not connected
  if (!github) {
    return (
      <section>
        <SectionTitle
          icon={Code2}
          title="GitHub"
          description="Developer activity"
        />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800">
                <Code2 className="h-6 w-6 text-slate-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Connect your GitHub
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Connect your GitHub account to display
                  your repositories, followers, stars and
                  contribution activity.
                </p>

                {error && (
                  <p className="mt-2 text-xs text-amber-400">
                    GitHub is not connected yet.
                  </p>
                )}
              </div>
            </div>

            <a
              href={`${API}/github/connect`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              <Code2 className="h-4 w-4" />
              Connect GitHub
            </a>
          </div>
        </div>
      </section>
    );
  }

  const safeRepositories = Array.isArray(
    repositories
  )
    ? repositories
    : [];

  const totalStars =
    safeRepositories.reduce(
      (sum, repo) =>
        sum + Number(repo?.stars || 0),
      0
    );

  const totalForks =
    safeRepositories.reduce(
      (sum, repo) =>
        sum + Number(repo?.forks || 0),
      0
    );

  return (
    <section>
      <SectionTitle
        icon={Code2}
        title="GitHub"
        description="Developer activity"
      />

      {/* PROFILE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {github.avatar_url ? (
              <img
                src={github.avatar_url}
                alt={
                  github.login || "GitHub"
                }
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                <Code2 className="h-7 w-7 text-slate-400" />
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white">
                {github.name ||
                  github.login ||
                  "GitHub User"}
              </h3>

              {github.login && (
                <p className="text-sm text-slate-400">
                  @{github.login}
                </p>
              )}

              {github.bio && (
                <p className="mt-1 max-w-xl text-xs text-slate-500">
                  {github.bio}
                </p>
              )}
            </div>
          </div>

          {github.html_url && (
            <a
              href={github.html_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
        </div>

        {/* STATS */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={BookOpen}
            label="Repositories"
            value={
              github.public_repos ?? 0
            }
          />

          <StatCard
            icon={Star}
            label="Stars"
            value={totalStars}
          />

          <StatCard
            icon={Users}
            label="Followers"
            value={
              github.followers ?? 0
            }
          />

          <StatCard
            icon={GitFork}
            label="Forks"
            value={totalForks}
          />
        </div>
      </div>

      {/* CONTRIBUTIONS */}
      <div className="mt-5">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white">
            Contributions
          </h3>

          <p className="text-xs text-slate-500">
            {contributions?.total || 0} contributions
          </p>
        </div>

        <ActivityGraph
          data={
            contributions?.contributionGraph ||
            []
          }
        />
      </div>

      {/* REPOSITORIES */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Top repositories
          </h3>

          <span className="text-xs text-slate-500">
            {safeRepositories.length} loaded
          </span>
        </div>

        {safeRepositories.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-500">
            No repositories found.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {safeRepositories
              .slice(0, 6)
              .map((repo) => (
                <a
                  key={
                    repo.id ||
                    repo.full_name ||
                    repo.name
                  }
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-white">
                        {repo.name}
                      </h4>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {repo.description ||
                          "No description"}
                      </p>
                    </div>

                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:text-slate-300" />
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <Code2 className="h-3.5 w-3.5" />
                        {repo.language}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {repo.stars || 0}
                    </span>

                    <span className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5" />
                      {repo.forks || 0}
                    </span>
                  </div>
                </a>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// LEETCODE SECTION
// ============================================================

function LeetCodeSection({
  leetcode,
  loading,
  username,
  setUsername,
  onLoad,
  error,
}) {
  // ==========================================================
  // NO PROFILE YET
  // ==========================================================

  if (!leetcode) {
    return (
      <section>
        <SectionTitle
          icon={Code2}
          title="LeetCode"
          description="Problem solving"
        />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <label className="mb-2 block text-xs font-medium text-slate-400">
            LeetCode Username
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onLoad();
                }
              }}
              placeholder="Enter your LeetCode username"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-slate-500"
            />

            <button
              type="button"
              onClick={onLoad}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Code2 className="h-4 w-4" />
                  Load LeetCode
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3">
              <ErrorCard text={error} />
            </div>
          )}
        </div>
      </section>
    );
  }

  const solved =
    leetcode.solved || {};

  const contest =
    leetcode.contest || null;

  return (
    <section>
      <SectionTitle
        icon={Code2}
        title="LeetCode"
        description="Problem solving"
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        {/* PROFILE HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {leetcode.avatar ? (
              <img
                src={leetcode.avatar}
                alt={
                  leetcode.username ||
                  "LeetCode"
                }
                className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-700"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                <Code2 className="h-5 w-5 text-slate-400" />
              </div>
            )}

            <div>
              <h3 className="font-semibold text-white">
                {leetcode.realName ||
                  leetcode.username}
              </h3>

              <p className="text-xs text-slate-500">
                @{leetcode.username}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onLoad}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>

            {leetcode.profileUrl && (
              <a
                href={leetcode.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                LeetCode
              </a>
            )}
          </div>
        </div>

        {/* SOLVED STATS */}
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={Trophy}
            label="Total Solved"
            value={solved.total}
          />

          <StatCard
            icon={Code2}
            label="Easy"
            value={solved.easy}
          />

          <StatCard
            icon={Code2}
            label="Medium"
            value={solved.medium}
          />

          <StatCard
            icon={Code2}
            label="Hard"
            value={solved.hard}
          />
        </div>

        {/* CONTEST */}
        {contest && (
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[11px] text-slate-500">
                Contest Rating
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {contest.rating || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[11px] text-slate-500">
                Global Rank
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {contest.globalRanking || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[11px] text-slate-500">
                Top %
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {contest.topPercentage
                  ? `${contest.topPercentage}%`
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
              <p className="text-[11px] text-slate-500">
                Contests
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {contest.attendedContests || 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CHANGE USERNAME */}
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <label className="mb-2 block text-xs font-medium text-slate-400">
          Change LeetCode Username
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onLoad();
              }
            }}
            placeholder="Enter another username"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
          />

          <button
            type="button"
            onClick={onLoad}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load"
            )}
          </button>
        </div>

        {error && (
          <div className="mt-3">
            <ErrorCard text={error} />
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// LINKEDIN SECTION
// ============================================================

function LinkedInSection({
  linkedin,
  loading,
  onRefresh,
}) {
  // Loading
  if (loading) {
    return (
      <section>
        <SectionTitle
          icon={Code2}
          title="LinkedIn"
          description="Professional profile"
        />

        <LoadingCard text="Checking LinkedIn..." />
      </section>
    );
  }

  return (
    <section>
      <SectionTitle
        icon={Code2}
        title="LinkedIn"
        description="Professional profile"
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        {linkedin ? (
          <div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {linkedin.picture ? (
                  <img
                    src={linkedin.picture}
                    alt={
                      linkedin.name ||
                      "LinkedIn User"
                    }
                    className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-700"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800">
                    <CircleUserRound className="h-7 w-7 text-slate-400" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {linkedin.name ||
                        "LinkedIn User"}
                    </h3>

                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {linkedin.email ||
                      "LinkedIn account connected"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
              >
                Open LinkedIn
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
              <Code2 className="h-6 w-6 text-blue-400" />
            </div>

            <h3 className="font-semibold text-white">
              Connect your LinkedIn
            </h3>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
              Connect your LinkedIn account to display
              your professional identity on your
              UniSphere profile.
            </p>

            <a
              href={`${API}/linkedin/connect`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Connect LinkedIn
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function PublicProfile() {
  // ==========================================================
  // STATES
  // ==========================================================

  const [github, setGithub] =
    useState(null);

  const [repositories, setRepositories] =
    useState([]);

  const [contributions, setContributions] =
    useState(null);

  const [githubError, setGithubError] =
    useState("");

  const [leetcode, setLeetcode] =
    useState(null);

  const [leetcodeUsername, setLeetcodeUsername] =
    useState("");

  const [leetcodeLoading, setLeetcodeLoading] =
    useState(false);

  const [leetcodeError, setLeetcodeError] =
    useState("");

  const [linkedin, setLinkedin] =
    useState(null);

  const [linkedinError, setLinkedinError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // GITHUB
  // ==========================================================

  const fetchGitHub = async () => {
    try {
      setGithubError("");

      const [
        profileResponse,
        reposResponse,
        contributionResponse,
      ] = await Promise.all([
        fetch(`${API}/github/profile`),
        fetch(`${API}/github/repositories`),
        fetch(`${API}/github/contributions`),
      ]);

      const profileData =
        await profileResponse.json();

      const reposData =
        await reposResponse.json();

      const contributionData =
        await contributionResponse.json();

      // GitHub not connected
      if (
        profileResponse.status === 401 ||
        !profileData.success
      ) {
        setGithub(null);
        setRepositories([]);
        setContributions(null);

        setGithubError(
          profileData.message ||
            "GitHub is not connected"
        );

        return;
      }

      // Profile
      setGithub(
        profileData.github || null
      );

      // Repositories
      if (
        reposResponse.ok &&
        reposData.success
      ) {
        setRepositories(
          reposData.repositories || []
        );
      } else {
        setRepositories([]);
      }

      // Contributions
      if (
        contributionResponse.ok &&
        contributionData.success
      ) {
        setContributions({
          total:
            contributionData.total || 0,
          contributionGraph:
            contributionData.contributionGraph ||
            [],
        });
      } else {
        setContributions(null);
      }
    } catch (error) {
      console.error(
        "GitHub error:",
        error
      );

      setGithub(null);
      setRepositories([]);
      setContributions(null);

      setGithubError(
        "Unable to connect to GitHub backend."
      );
    }
  };

  // ==========================================================
  // LEETCODE
  // ==========================================================

  const fetchLeetCode = async (
    username = leetcodeUsername
  ) => {
    const cleanUsername =
      username?.trim();

    if (!cleanUsername) {
      setLeetcodeError(
        "Please enter your LeetCode username."
      );
      return;
    }

    try {
      setLeetcodeLoading(true);
      setLeetcodeError("");

      const response = await fetch(
        `${API}/leetcode/profile/${encodeURIComponent(
          cleanUsername
        )}`
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not fetch LeetCode profile. Check username."
        );
      }

      setLeetcode(
        data.leetcode || null
      );

      setLeetcodeUsername(
        cleanUsername
      );
    } catch (error) {
      console.error(
        "LeetCode error:",
        error
      );

      setLeetcodeError(
        error.message ||
          "Could not fetch LeetCode profile."
      );
    } finally {
      setLeetcodeLoading(false);
    }
  };

  // ==========================================================
  // LINKEDIN
  // ==========================================================

  const fetchLinkedIn = async () => {
    try {
      setLinkedinError("");

      const response = await fetch(
        `${API}/linkedin/profile`
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // Not connected
      if (
        response.status === 401 ||
        !data.success ||
        !data.linkedin
      ) {
        setLinkedin(null);

        setLinkedinError(
          data.message ||
            "LinkedIn is not connected"
        );

        return;
      }

      setLinkedin(
        data.linkedin
      );
    } catch (error) {
      console.error(
        "LinkedIn error:",
        error
      );

      setLinkedin(null);

      setLinkedinError(
        "Unable to connect to LinkedIn backend."
      );
    }
  };

  // ==========================================================
  // LOAD GITHUB + LINKEDIN
  // LEETCODE IS MANUAL
  // ==========================================================

  const fetchAllProfileData = async () => {
    setLoading(true);

    await Promise.allSettled([
      fetchGitHub(),
      fetchLinkedIn(),
    ]);

    setLoading(false);
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchAllProfileData();
  }, []);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const solved =
      leetcode?.solved?.total || 0;

    const repos =
      github?.public_repos || 0;

    const followers =
      github?.followers || 0;

    return {
      solved,
      repos,
      followers,
    };
  }, [leetcode, github]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CircleUserRound className="h-5 w-5 text-slate-400" />

              <h1 className="text-2xl font-bold tracking-tight">
                Public Profile
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Your developer identity across
              GitHub, LeetCode and LinkedIn.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAllProfileData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading
                  ? "animate-spin"
                  : ""
              }`}
            />

            Refresh all
          </button>
        </div>

        {/* ==================================================
            QUICK SUMMARY
        ================================================== */}

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">
              GitHub repositories
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {summary.repos}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">
              LeetCode solved
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {summary.solved}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs text-slate-500">
              GitHub followers
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {summary.followers}
            </p>
          </div>
        </div>

        {/* ==================================================
            MAIN SECTIONS
        ================================================== */}

        <div className="space-y-8">

          {/* GITHUB */}

          <GitHubSection
            github={github}
            repositories={repositories}
            contributions={contributions}
            loading={
              loading && github === null
            }
            error={githubError}
          />

          {/* LEETCODE */}

          <LeetCodeSection
            leetcode={leetcode}
            loading={leetcodeLoading}
            username={leetcodeUsername}
            setUsername={
              setLeetcodeUsername
            }
            onLoad={() =>
              fetchLeetCode(
                leetcodeUsername
              )
            }
            error={leetcodeError}
          />

          {/* LINKEDIN */}

          <LinkedInSection
            linkedin={linkedin}
            loading={
              loading &&
              linkedin === null
            }
            onRefresh={fetchLinkedIn}
          />
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-10 border-t border-slate-800 pt-5 text-center text-xs text-slate-600">
          UniSphere Public Developer Profile
        </div>
      </div>
    </div>
  );
}