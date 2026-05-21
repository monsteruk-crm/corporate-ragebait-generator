import Image from "next/image";
import type { RagebaitPost } from "../../lib/types";

const PLACEHOLDER_POST: RagebaitPost = {
  authorName: "Derek Quantum",
  authorTitle: "Chief Vision Synergy Evangelist at CloudPanic Labs",
  headline: "I FIRED OUR BOARD AND REPLACED THEM WITH AI HAMSTERS",
  body: "After 12 minutes with autonomous agent hamsters, productivity rose by 9000%. Nobody asked for this. Everyone thanked me anyway.",
  hashtags: ["#AIFirst", "#NoDaysOff", "#FounderMindset", "#PivotHarder"],
  reactionCount: 9271,
  commentCount: 1428,
  repostCount: 503,
  imagePrompt:
    "Pixel-art office dystopia with a founder presenting to robotic hamsters in suits, exaggerated retro UI style.",
};

type LinkedInPostPreviewProps = {
  post: RagebaitPost;
  imageUrl: string | null;
};

export function LinkedInPostPreview({ post, imageUrl }: LinkedInPostPreviewProps) {
  return (
    <section aria-label="Post preview">
      <h2 className="text-lg font-bold text-slate-900">Fake LinkedIn Preview</h2>

      <article className="mt-4 rounded-xl border border-blue-200 bg-sky-50/35 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)]">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full border-2 border-slate-900 bg-gradient-to-br from-amber-300 to-rose-400" />
          <div>
            <p className="font-bold text-slate-900">{post.authorName}</p>
            <p className="text-sm text-slate-700">{post.authorTitle}</p>
          </div>
        </div>

        <h3 className="mt-4 text-xl font-black uppercase tracking-tight text-slate-900">
          {post.headline}
        </h3>
        <p className="mt-3 text-slate-800">{post.body}</p>
        <p className="mt-3 text-sm font-semibold text-indigo-700">
          {post.hashtags.join(" ")}
        </p>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Generated satirical support image"
            width={1024}
            height={1024}
            unoptimized
            className="mt-4 h-auto w-full rounded-lg border border-slate-300"
          />
        ) : (
          <div className="mt-4 rounded-lg border-2 border-dashed border-slate-400 bg-white/80 p-8 text-center text-sm text-slate-600">
            Support image placeholder
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-300 pt-3 text-sm font-semibold text-slate-700">
          <span>{post.reactionCount.toLocaleString()} reactions</span>
          <span>{post.commentCount.toLocaleString()} comments</span>
          <span>{post.repostCount.toLocaleString()} reposts</span>
        </div>
      </article>
    </section>
  );
}

export { PLACEHOLDER_POST };
