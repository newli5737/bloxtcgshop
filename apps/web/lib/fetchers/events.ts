import { apiFetch } from "../api";

export type EventItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  prizeDescription: string | null;
  imageUrl: string | null;
  status: string;
  maxParticipants: number;
  winningNumber: number | null;
  drawDate: string | null;
  drawnAt: string | null;
  createdAt: string;
  _count: { registrations: number };
};

export type EventRegistration = {
  id: string;
  luckyNumber: number;
  isWinner: boolean;
  createdAt: string;
};

export async function fetchEvents(): Promise<EventItem[]> {
  const res = await apiFetch<EventItem[]>("events");
  return res.data;
}

export async function fetchEventBySlug(slug: string): Promise<EventItem> {
  const res = await apiFetch<EventItem>(`events/${slug}`);
  return res.data;
}

export async function registerForEvent(eventId: string): Promise<{ luckyNumber: number }> {
  const res = await apiFetch<{ luckyNumber: number }>(`events/${eventId}/register`, {
    method: "POST",
  });
  return res.data;
}

export async function fetchMyRegistration(eventId: string): Promise<EventRegistration | null> {
  try {
    const res = await apiFetch<EventRegistration>(`events/${eventId}/my-registration`);
    return res.data;
  } catch {
    return null;
  }
}
