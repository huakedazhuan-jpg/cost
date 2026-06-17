import type { ExpenseSplit, Member } from "./types";

export function buildEqualSplits(amountCents: number, members: Member[]): ExpenseSplit[] {
  if (members.length !== 2) {
    throw new Error("Equal split currently supports exactly two members");
  }

  const firstShare = Math.floor(amountCents / 2);
  return [
    { memberId: members[0].id, shareCents: firstShare },
    { memberId: members[1].id, shareCents: amountCents - firstShare },
  ];
}

export function buildSingleMemberSplit(
  amountCents: number,
  members: Member[],
  responsibleMemberId: string,
): ExpenseSplit[] {
  if (!members.some((member) => member.id === responsibleMemberId)) {
    throw new Error(`Unknown responsible member: ${responsibleMemberId}`);
  }

  return members.map((member) => ({
    memberId: member.id,
    shareCents: member.id === responsibleMemberId ? amountCents : 0,
  }));
}

export function buildCustomSplits(
  amountCents: number,
  members: Member[],
  shares: Record<string, number>,
): ExpenseSplit[] {
  const splits = members.map((member) => ({
    memberId: member.id,
    shareCents: shares[member.id] ?? 0,
  }));

  const total = splits.reduce((sum, split) => sum + split.shareCents, 0);
  if (total !== amountCents) {
    throw new Error("Custom split must equal expense total");
  }

  return splits;
}
