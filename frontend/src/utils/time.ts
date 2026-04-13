import { formatDistanceToNowStrict } from "date-fns";

export function getTimeAgo(createdAt: Date | string): string {
  return formatDistanceToNowStrict(new Date(createdAt), { addSuffix: true });
}
