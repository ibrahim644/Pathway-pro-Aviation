import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { settingsQuery, SETTINGS_FALLBACK } from "@/lib/content";

export function WhatsAppButton() {
  const { data: settings } = useQuery(settingsQuery);
  const number = (settings ?? SETTINGS_FALLBACK).whatsapp;

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent(
        "Hello Pathway Pro, I would like to know more about your aviation training programmes.",
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-success px-4 py-3 text-success-foreground shadow-lift transition-transform hover:scale-105"
    >
      <MessageCircle className="size-5" />
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
    </a>
  );
}
