"use client";

import { useState } from "react";
import { TeamInviteModal } from "@/components/teams/TeamInviteModal";
import { UserPlus } from "lucide-react";

export function TeamInviteModalTrigger({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        邀请成员
      </button>
      <TeamInviteModal
        teamId={teamId}
        teamName={teamName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
