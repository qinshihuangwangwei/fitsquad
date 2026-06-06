"use client";

import { Crown, User, LogOut, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Member {
  userId?: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    bodyWeight?: number | null;
  };
  role: string;
}

interface TeamMemberListProps {
  members: Member[];
  captainId: string;
  currentUserId?: string;
  teamId?: string;
}

export function TeamMemberList({
  members,
  captainId,
  currentUserId,
  teamId,
}: TeamMemberListProps) {
  const router = useRouter();
  const isCurrentUserCaptain = currentUserId === captainId;
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [confirmKick, setConfirmKick] = useState<string | null>(null);

  const handleKick = async (userId: string) => {
    if (!teamId) return;
    setKickingId(userId);
    await fetch(`/api/teams/${teamId}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    router.refresh();
    setKickingId(null);
    setConfirmKick(null);
  };

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const isCaptain = member.user.id === captainId;
        const isMe = member.user.id === currentUserId;

        return (
          <div
            key={member.user.id}
            className="flex items-center gap-3 rounded-lg border border-surface-100 bg-surface-50 p-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 overflow-hidden flex-shrink-0">
              {member.user.avatar ? (
                <img
                  src={member.user.avatar}
                  alt={member.user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                member.user.name[0]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-surface-900">
                {member.user.name}
                {isCaptain && (
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                )}
                {isMe && (
                  <span className="text-[10px] text-surface-400">(我)</span>
                )}
              </p>
              <p className="text-xs text-surface-400 truncate">
                ID: {member.user.id.slice(0, 8)}...
                {member.user.bodyWeight && (
                  <span className="ml-2">
                    体重: {member.user.bodyWeight} KG
                  </span>
                )}
              </p>
            </div>

            {/* 队长可见的踢出按钮（不能踢自己） */}
            {isCurrentUserCaptain && !isCaptain && (
              <div>
                {confirmKick === member.user.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleKick(member.user.id)}
                      disabled={kickingId === member.user.id}
                      className="rounded bg-red-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {kickingId === member.user.id ? "..." : "确认踢出"}
                    </button>
                    <button
                      onClick={() => setConfirmKick(null)}
                      className="rounded border border-surface-300 px-2 py-1 text-[10px] text-surface-500 hover:bg-white"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmKick(member.user.id)}
                    className="flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-[10px] text-red-500 hover:bg-red-50"
                  >
                    <UserMinus className="h-3 w-3" />
                    踢出
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
