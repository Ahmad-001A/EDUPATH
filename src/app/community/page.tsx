"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2, MessageCircle, Shield, GraduationCap } from "lucide-react";
import EmptyState from "@/components/EmptyState";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string | null; role: string };
};
type Post = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string; role: string };
  comments: Comment[];
};

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const fetchPosts = async () => {
    const res = await fetch("/api/posts", { cache: "no-store" });
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setContent("");
    await fetchPosts();
    setSending(false);
  };

  const addComment = async (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setCommentText({ ...commentText, [postId]: "" });
    await fetchPosts();
  };

  const roleBadge = (role: string) => {
    if (role === "ADMIN")
      return {
        label: "Админ",
        color: "bg-purple-100 text-purple-700",
        icon: Shield,
      };
    if (role === "TEACHER")
      return {
        label: "Учитель",
        color: "bg-blue-100 text-blue-700",
        icon: GraduationCap,
      };
    return null;
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Сообщество</h1>
        <p className="text-gray-500 mt-1">
          Общайтесь, делитесь опытом и находите единомышленников
        </p>
      </div>

      {session && (
        <form
          onSubmit={handleSubmit}
          className="glass p-5 rounded-2xl border border-white/40 animate-fadeInUp"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Поделитесь чем-нибудь..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Отправить
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Сообщество пустое"
          description="Пока никто не публиковал посты. Будьте первым — поделитесь опытом или задайте вопрос!"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => {
            const badge = roleBadge(post.user.role);
            const BadgeIcon = badge?.icon;
            return (
              <div
                key={post.id}
                className="glass p-5 rounded-2xl border border-white/40 animate-fadeInUp"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {post.user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {post.user.name || "Аноним"}
                      </p>
                      {badge && BadgeIcon && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${badge.color} px-2 py-0.5 rounded-full`}
                        >
                          <BadgeIcon className="w-3 h-3" /> {badge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">
                  {post.content}
                </p>

                {post.comments.length > 0 && (
                  <div className="border-t border-white/40 pt-3 space-y-2 mb-3">
                    {post.comments.map((c) => {
                      const cb = roleBadge(c.user.role);
                      const CbIcon = cb?.icon;
                      return (
                        <div key={c.id} className="flex items-start gap-2">
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                            {c.user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium">
                                {c.user.name || "Аноним"}
                              </span>
                              {cb && CbIcon && (
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-medium ${cb.color} px-1.5 py-0.5 rounded-full`}
                                >
                                  {cb.label}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {session && (
                  <div className="flex gap-2">
                    <input
                      value={commentText[post.id] || ""}
                      onChange={(e) =>
                        setCommentText({
                          ...commentText,
                          [post.id]: e.target.value,
                        })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && addComment(post.id)
                      }
                      placeholder="Комментарий..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => addComment(post.id)}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}