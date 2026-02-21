"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { AccountProfile } from "@/lib/types";

type ProfilePageProps = {
  username: string;
};

export function ProfilePage({ username }: ProfilePageProps) {
  const { currentUser, updateMyBio } = useAppState();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [bioDraft, setBioDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = useMemo(
    () => currentUser?.username.toLowerCase() === username.toLowerCase(),
    [currentUser?.username, username]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/profiles/${encodeURIComponent(username)}`)
      .then(async (response) => {
        const json = await response.json();
        if (!active) return;
        if (!response.ok) {
          setMessage(json?.message || "Profile not found.");
          setProfile(null);
          return;
        }
        setProfile(json.profile);
        setBioDraft(json.profile?.bio ?? "");
      })
      .catch(() => {
        if (!active) return;
        setMessage("Failed to load profile.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [username]);

  async function onBioSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await updateMyBio(bioDraft);
    setMessage(result.message);
    if (!result.ok) return;

    setProfile((prev) => (prev ? { ...prev, bio: bioDraft || null } : prev));
  }

  if (loading) {
    return <p className="text-sm text-muted">Loading profile...</p>;
  }

  if (!profile) {
    return (
      <section className="rounded-2xl border border-line bg-panel/95 p-5">
        <h1 className="font-display text-2xl">Profile</h1>
        <p className="mt-2 text-sm text-rose-300">{message || "Profile not found."}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-line bg-panel/95 p-5">
        <h1 className="font-display text-2xl">@{profile.username}</h1>
        <p className="mt-1 text-xs text-muted">
          Joined: {new Date(profile.createdAt).toLocaleDateString("ru-RU")}
        </p>

        {isOwnProfile ? (
          <form onSubmit={onBioSubmit} className="mt-4 max-w-xl space-y-2">
            <label className="block text-sm text-muted">
              Bio
              <textarea
                value={bioDraft}
                onChange={(event) => setBioDraft(event.target.value)}
                maxLength={180}
                rows={3}
                className="mt-1 w-full rounded-lg border border-line bg-[#070b11] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-500"
                placeholder="Tell players what you trade..."
              />
            </label>
            <button
              type="submit"
              className="rounded-lg border border-accent/40 bg-gradient-to-b from-accent to-accentStrong px-4 py-2 text-sm font-semibold text-white"
            >
              Save profile
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-slate-200">{profile.bio || "No bio yet."}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Open created</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">{profile.stats.createdOpen}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Total created</p>
          <p className="mt-1 text-2xl font-bold text-slate-100">{profile.stats.createdTotal}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Currently taken</p>
          <p className="mt-1 text-2xl font-bold text-blue-300">{profile.stats.claimedActive}</p>
        </article>
        <article className="rounded-xl border border-line bg-panel/95 p-4">
          <p className="text-xs text-muted">Completed as taker</p>
          <p className="mt-1 text-2xl font-bold text-sky-300">{profile.stats.completedAsClaimer}</p>
        </article>
      </div>

      {message ? (
        <div className="rounded-xl border border-line bg-[#0d131e] px-4 py-2 text-sm text-slate-100">
          {message}
        </div>
      ) : null}
    </section>
  );
}
