import { useEffect, useState } from "react";
import api from "../services/api";

const BenefitCard = ({ benefit }) => {
  const title =
    benefit.title ||
    benefit.name ||
    benefit.brand ||
    "Student Benefit";

  const brand =
    benefit.brand ||
    benefit.company ||
    benefit.merchant ||
    "";

  const description =
    benefit.description ||
    benefit.short_description ||
    benefit.shortDescription ||
    "";

  const image =
    benefit.logo ||
    benefit.logo_url ||
    benefit.logoUrl ||
    benefit.image ||
    benefit.image_url ||
    benefit.thumbnail ||
    "";

  const url =
    benefit.url ||
    benefit.link ||
    benefit.website ||
    benefit.claim_url ||
    benefit.claimUrl ||
    "";

  // Actual offer data
  const offer =
    benefit.offers ||
    benefit.offer ||
    benefit.discount ||
    benefit.discount_text ||
    benefit.discountText ||
    benefit.value ||
    benefit.deal ||
    "";

  const location =
    benefit.location ||
    benefit.region ||
    benefit.availability ||
    "Global";

  // Tags
  let tags = [];

  if (Array.isArray(benefit.tags)) {
    tags = benefit.tags;
  } else if (Array.isArray(benefit.types)) {
    tags = benefit.types;
  } else if (typeof benefit.tags === "string") {
    tags = benefit.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return (
    <div className="group flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#252525] transition duration-200 hover:-translate-y-1 hover:border-zinc-600">

      {/* CARD BODY */}
      <div className="flex flex-1 flex-col p-5">

        {/* TOP */}
        <div className="flex items-start justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3">

            {/* LOGO */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2">

              {image ? (
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xl font-bold text-zinc-700">
                  {title.charAt(0).toUpperCase()}
                </span>
              )}

            </div>

            {/* TITLE */}
            <div className="min-w-0">

              <h3 className="truncate text-base font-bold text-white">
                {title}
              </h3>

              {brand && brand !== title && (
                <p className="mt-1 truncate text-xs text-zinc-500">
                  {brand}
                </p>
              )}

            </div>

          </div>

          <button
            type="button"
            className="shrink-0 text-xl text-zinc-500 transition hover:text-white"
            title="Save"
          >
            ♡
          </button>

        </div>

        {/* TAGS */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">

            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-300"
              >
                {tag}
              </span>
            ))}

          </div>
        )}

        {/* OFFER */}
        {offer && (
          <div className="mt-5 min-h-[62px] rounded-xl border border-yellow-700/40 bg-yellow-500/10 px-4 py-3">

            <p className="line-clamp-2 text-sm font-bold leading-5 text-yellow-300">
              {Array.isArray(offer)
                ? offer.join(" • ")
                : String(offer)}
            </p>

          </div>
        )}

        {/* DESCRIPTION */}
        {description && (
          <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-400">
            {description}
          </p>
        )}

        {/* CLAIM BUTTON */}
        <div className="mt-auto pt-6">

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Claim Offer
              <span className="text-lg">↗</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-14 w-full cursor-not-allowed items-center justify-center rounded-xl bg-zinc-700 text-sm font-semibold text-zinc-500"
            >
              Offer unavailable
            </button>
          )}

        </div>

      </div>

      {/* LOCATION */}
      <div className="border-t border-zinc-800 px-5 py-3">

        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
          ⌖
          {location}
        </span>

      </div>

    </div>
  );
};

const Benefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/opportunities/student-offers"
      );

      console.log(
        "STUDENT OFFERS RESPONSE:",
        response.data
      );

      const data = response.data;

      const offers =
        data?.benefits ||
        data?.offers ||
        data?.data ||
        [];

      setBenefits(
        Array.isArray(offers)
          ? offers
          : []
      );

    } catch (error) {
      console.error(
        "Student Benefits Error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Unable to load student benefits"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
  }, []);

  return (
    <div className="min-h-full bg-[#111111] px-4 py-6 text-white md:px-8 md:py-8">

      <div className="mx-auto max-w-[1500px]">

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
            Student Perks
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Student Benefits
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Discover student discounts, free tools,
            credits and exclusive benefits.
          </p>

        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-[420px] animate-pulse rounded-2xl border border-zinc-800 bg-[#1D1D1D]"
                />
              )
            )}

          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 px-6 py-16 text-center">

            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchBenefits}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          benefits.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-[#1A1A1A] px-6 py-20 text-center">

              <h2 className="text-lg font-semibold text-white">
                No offers found
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                No student benefits are available right now.
              </p>

            </div>
          )}

        {/* ================= OFFERS ================= */}

        {!loading &&
          !error &&
          benefits.length > 0 && (
            <>
              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    All Student Offers
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    {benefits.length} offers available
                  </p>
                </div>

              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {benefits.map((benefit, index) => (
                  <BenefitCard
                    key={
                      benefit.id ||
                      benefit._id ||
                      benefit.slug ||
                      index
                    }
                    benefit={benefit}
                  />
                ))}

              </div>
            </>
          )}

      </div>

    </div>
  );
};

export default Benefits;