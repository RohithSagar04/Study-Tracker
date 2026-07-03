"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PushSubscribeButton() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "subscribed" | "denied" | "unsupported"
  >("idle");
  const [message, setMessage] = useState("");

  async function subscribe() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setMessage("VAPID public key not configured");
      return;
    }

    setStatus("loading");

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      if (!res.ok) throw new Error("Failed to save subscription");

      setStatus("subscribed");
      setMessage("Daily reminders enabled!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Subscription failed");
      setStatus("idle");
    }
  }

  async function sendTest() {
    setMessage("");
    const res = await fetch("/api/push/test", { method: "POST" });
    const data = await res.json();
    setMessage(data.message || (res.ok ? "Test sent!" : "Test failed"));
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-zinc-500">
        Push notifications are not supported in this browser.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {status === "subscribed" ? (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          ✓ Notifications enabled
        </p>
      ) : (
        <button
          onClick={subscribe}
          disabled={status === "loading"}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {status === "loading" ? "Enabling…" : "Enable daily reminders"}
        </button>
      )}
      {status === "denied" && (
        <p className="text-sm text-red-600">
          Permission denied. Allow notifications in browser settings.
        </p>
      )}
      {status === "subscribed" && (
        <button
          onClick={sendTest}
          className="text-sm text-indigo-600 hover:underline"
        >
          Send test notification
        </button>
      )}
      {message && <p className="text-sm text-zinc-500">{message}</p>}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
