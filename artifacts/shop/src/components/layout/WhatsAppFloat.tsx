import { useState } from "react";
import { ChevronUp, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const CONTACTS = [
  {
    label: "Sales & Orders",
    number: "+968 7214 2828",
    href: "https://wa.me/96872142828?text=Hi%2C%20I%20need%20help%20with%20an%20order",
  },
  {
    label: "Customer Support",
    number: "+968 9316 2391",
    href: "https://wa.me/96893162391?text=Hi%2C%20I%20need%20customer%20support",
  },
];

export function WhatsAppFloat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-[76px] right-3 z-[60] md:bottom-6 md:right-6">
      {open && (
        <div
          className="absolute bottom-full right-0 mb-3 w-[min(250px,calc(100vw-1.5rem))] rounded-2xl border border-border bg-white p-2 shadow-2xl"
          role="dialog"
          aria-label="WhatsApp contacts"
        >
          <div className="px-3 pb-2 pt-1">
            <p className="text-sm font-bold text-foreground">Chat with us</p>
            <p className="text-xs text-muted-foreground">Choose a business number</p>
          </div>
          <div className="space-y-1">
            {CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={contact.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-green-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                  <FaWhatsapp className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{contact.label}</span>
                  <span className="block text-xs text-muted-foreground">{contact.number}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-label={open ? "Close WhatsApp contacts" : "Open WhatsApp contacts"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-green-900/25 ring-4 ring-white transition-transform hover:scale-105 active:scale-95 dark:ring-background"
      >
        {open ? <X className="h-6 w-6" /> : <FaWhatsapp className="h-7 w-7" />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#168c43] shadow-sm">
            <ChevronUp className="h-3.5 w-3.5" />
          </span>
        )}
      </button>
    </div>
  );
}