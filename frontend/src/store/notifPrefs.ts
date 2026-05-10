// Bildirishnoma sozlamalari va lokal holat (read/snooze).
// Hammasi localStorage'da saqlanadi (per-foydalanuvchi-brauzer).

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type RefreshInterval = 30 | 60 | 120 | 300; // soniyalarda

interface NotifPrefsState {
  // Ovoz: yangi urgent bildirishnoma bo'lganda
  soundEnabled: boolean;
  // Brauzerning native push (tab yopiq bo'lsa ham)
  browserEnabled: boolean;
  // Yangilash chastotasi (sekund)
  refreshSeconds: RefreshInterval;
  // O'qildi deb belgilangan ID'lar (`${kind}:${id}` formatida)
  readKeys: Record<string, true>;
  // Snooze: ID -> "qachongacha yashirish" (Date timestamp)
  snoozedUntil: Record<string, number>;
  // Oxirgi ko'rilgan urgent total (ovoz triggeri uchun)
  lastSeenUrgentCount: number;

  // Setters
  setSound: (v: boolean) => void;
  setBrowser: (v: boolean) => void;
  setRefresh: (s: RefreshInterval) => void;
  markRead: (key: string) => void;
  markAllRead: (keys: string[]) => void;
  snooze: (key: string, hours: number) => void;
  unsnooze: (key: string) => void;
  setLastSeenUrgent: (n: number) => void;
}

export const useNotifPrefs = create<NotifPrefsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      browserEnabled: false,
      refreshSeconds: 60,
      readKeys: {},
      snoozedUntil: {},
      lastSeenUrgentCount: 0,

      setSound: (v) => set({ soundEnabled: v }),
      setBrowser: (v) => set({ browserEnabled: v }),
      setRefresh: (s) => set({ refreshSeconds: s }),
      markRead: (key) =>
        set((s) => ({ readKeys: { ...s.readKeys, [key]: true } })),
      markAllRead: (keys) =>
        set((s) => {
          const next = { ...s.readKeys };
          for (const k of keys) next[k] = true;
          return { readKeys: next };
        }),
      snooze: (key, hours) =>
        set((s) => ({
          snoozedUntil: {
            ...s.snoozedUntil,
            [key]: Date.now() + hours * 3_600_000,
          },
        })),
      unsnooze: (key) =>
        set((s) => {
          const next = { ...s.snoozedUntil };
          delete next[key];
          return { snoozedUntil: next };
        }),
      setLastSeenUrgent: (n) => set({ lastSeenUrgentCount: n }),
    }),
    { name: "gz-notif-prefs" },
  ),
);

export function isSnoozed(key: string): boolean {
  const until = useNotifPrefs.getState().snoozedUntil[key];
  if (!until) return false;
  if (Date.now() < until) return true;
  // muddati o'tgan — tozalash
  useNotifPrefs.getState().unsnooze(key);
  return false;
}

/**
 * Brauzer notification API orqali xabar yuborish.
 * `browserEnabled=true` bo'lsa va ruxsat berilgan bo'lsa.
 */
export async function maybeShowBrowserNotification(
  title: string,
  body: string,
  tag?: string,
): Promise<void> {
  const enabled = useNotifPrefs.getState().browserEnabled;
  if (!enabled) return;
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "denied") return;
  if (Notification.permission === "default") {
    try {
      const r = await Notification.requestPermission();
      if (r !== "granted") return;
    } catch {
      return;
    }
  }
  try {
    const n = new Notification(title, { body, tag, icon: "/favicon.ico" });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch {
    // browser unsupported / quota exhausted — jim turamiz
  }
}

/**
 * Yangi urgent bildirishnoma kelganda chiqariladigan qisqa "ding" tovushi.
 * WebAudio orqali — qo'shimcha audio fayl talab qilmaydi.
 */
export function playChime(): void {
  if (!useNotifPrefs.getState().soundEnabled) return;
  try {
    const w = window as unknown as { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {
    // audio'ga ruxsat yo'q yoki xatolik — jim turamiz
  }
}
