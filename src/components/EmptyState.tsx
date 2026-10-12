import Link from "next/link";

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  compact = false,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`glass rounded-3xl border border-white/40 text-center animate-fadeInUp ${
        compact ? "p-8" : "p-12 md:p-16"
      }`}
    >
      <div className="max-w-md mx-auto">
        <img
          src="/hero.png"
          alt=""
          className={`mx-auto mb-6 object-contain opacity-90 ${
            compact ? "w-40 h-40" : "w-64 h-64"
          }`}
        />
        <h3 className="text-xl font-bold mb-2 gradient-text">{title}</h3>
        <p className="text-gray-500 mb-6">{description}</p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition shadow-lg"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}