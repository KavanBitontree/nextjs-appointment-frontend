"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MapPin, Loader2 } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
  showLocationButton?: boolean;
}

interface Coords {
  lat: number;
  lon: number;
}

type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

const NEARBY_KEYWORDS = [
  "near me",
  "nearby",
  "near by",
  "closest",
  "closest doctor",
  "doctors near",
  "find nearby",
  "location",
  "around me",
];

function isNearbyQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return NEARBY_KEYWORDS.some((kw) => lower.includes(kw));
}

// Normalises bot response text so ReactMarkdown renders lists correctly.
function normalizeMarkdown(raw: string): string {
  // Insert blank line before numbered list items if not already present
  let out = raw.replace(/(\S)\n(\d+\. )/g, "$1\n\n$2");
  // Insert blank line before bullet list items if not already present
  out = out.replace(/(\S)\n([•\-*] )/g, "$1\n\n$2");
  // Collapse 3+ newlines to max 2
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

export default function AarogyaAssistant() {
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderTexts = [
    "Ask for available slots...",
    "Find doctors...",
    "Find doctors with speciality...",
    "Request slots automatically...",
    "Check appointment status...",
    "Search by specialization...",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // ── Load history ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== "patient" || historyLoaded) return;
    const load = async () => {
      try {
        const { data } = await api.get("/chat/history");
        if (data.history?.length > 0) {
          setMessages(
            data.history.map((msg: any, idx: number) => ({
              id: `history-${idx}`,
              text: msg.content,
              sender: msg.role === "user" ? "user" : "bot",
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              suggestions: msg.suggestions ?? [],
            })),
          );
        }
      } catch {
        // silently fail
      } finally {
        setHistoryLoaded(true);
      }
    };
    load();
  }, [user, historyLoaded]);

  // ── Mobile detection ──────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── "Ask AA" pop-up prompt ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || user.role !== "patient") return;
    const t = setTimeout(
      () => {
        setShowPrompt(true);
        setTimeout(() => setShowPrompt(false), 5000);
      },
      Math.random() * 200 + 200,
    );
    return () => clearTimeout(t);
  }, [user]);

  // ── Placeholder cycle ─────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(
      () => setPlaceholderIndex((p) => (p + 1) % placeholderTexts.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Focus input on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!user || user.role !== "patient") return null;

  // ── Geolocation ───────────────────────────────────────────────────────────
  const requestLocation = (onSuccess: (c: Coords) => void) => {
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      appendBotMessage(
        "📍 Your browser doesn't support location. You can still search by specialization.",
        ["Find cardiologist", "Show all doctors"],
      );
      return;
    }

    setLocationStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c: Coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setCoords(c);
        setLocationStatus("granted");
        onSuccess(c);
      },
      (err) => {
        setLocationStatus("denied");
        if (err.code === err.PERMISSION_DENIED) {
          appendBotMessage(
            "📍 Location access was denied.\n\nTo enable it:\n• Chrome/Edge: Click the 🔒 icon in the address bar → Allow location\n• Firefox: Click the location icon → Allow\n• Safari: Settings → Safari → Location → Allow\n\nOr search doctors by specialization instead.",
            [
              "Find cardiologist",
              "Show all doctors",
              "List all specializations",
            ],
          );
        } else {
          appendBotMessage(
            "📍 Could not get your location. Please try again or search by specialization.",
            ["Find cardiologist", "Show all doctors"],
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const appendBotMessage = (text: string, suggestions?: string[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text,
        sender: "bot",
        timestamp: new Date(),
        suggestions,
      },
    ]);
  };

  // ── Core send ─────────────────────────────────────────────────────────────
  const sendMessage = async (text: string, overrideCoords?: Coords) => {
    if (!text.trim()) return;

    const isNearby = isNearbyQuery(text);

    if (isNearby && !coords && !overrideCoords) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: text.trim(),
          sender: "user",
          timestamp: new Date(),
        },
      ]);
      setInputValue("");

      setMessages((prev) => [
        ...prev,
        {
          id: `loc-req-${Date.now()}`,
          text: "📍 To find doctors near you, I need access to your location.",
          sender: "bot",
          timestamp: new Date(),
          showLocationButton: true,
          suggestions: [],
        },
      ]);

      requestLocation((c) => {
        sendMessageToAPI(text, c);
      });

      return;
    }

    const activeCoords =
      overrideCoords ?? (isNearby ? (coords ?? undefined) : undefined);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: text.trim(),
        sender: "user",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");

    await sendMessageToAPI(text, activeCoords);
  };

  const sendMessageToAPI = async (text: string, activeCoords?: Coords) => {
    setIsLoading(true);
    try {
      const payload: Record<string, any> = { message: text.trim() };
      if (activeCoords) {
        payload.latitude = activeCoords.lat;
        payload.longitude = activeCoords.lon;
      }

      const { data } = await api.post("/chat", payload);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
          suggestions: data.suggestions ?? [],
        },
      ]);
    } catch {
      appendBotMessage(
        "Sorry, I'm having trouble connecting right now. Please try again.",
        ["Try again", "Find available slots", "Search doctors"],
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Location button handler ───────────────────────────────────────────────
  const handleShareLocation = () => {
    setLocationStatus("requesting");

    requestLocation((c) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.showLocationButton
            ? {
                ...m,
                showLocationButton: false,
                text: "📍 Location shared! Finding doctors near you...",
              }
            : m,
        ),
      );
      sendMessageToAPI("Find doctors near me", c);
    });
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowPrompt(false);
    if (messages.length === 0 && historyLoaded) {
      setMessages([
        {
          id: "welcome",
          text: "Hello! 👋 I'm Aarogya Assistant (AA), your healthcare companion. How can I help you today?",
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            "Find available slots",
            "Search doctors",
            "Find doctors near me",
            "Check my appointments",
          ],
        },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="absolute bottom-20 right-0 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap"
                >
                  <div className="text-sm font-medium">Ask AA</div>
                  <div className="text-xs text-slate-300">
                    Your health assistant
                  </div>
                  <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-3 h-3 bg-slate-900" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleOpen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={showPrompt ? { y: [0, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: showPrompt ? 3 : 0 }}
              className="w-16 h-16 bg-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-colors group relative overflow-hidden transform-gpu will-change-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <Image
                  src="/images/bot.svg"
                  alt="Aarogya Assistant"
                  width={56}
                  height={56}
                  className="w-14 h-14"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat Window ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsOpen(false)}
              />
            )}

            <motion.div
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed z-50 bg-white shadow-2xl flex flex-col ${
                isMobile
                  ? "inset-0"
                  : "top-0 right-0 bottom-0 w-full md:w-[450px] border-l border-slate-200"
              }`}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <Image
                      src="/images/bot.svg"
                      alt="AA"
                      width={44}
                      height={44}
                      className="w-11 h-11"
                      style={{ imageRendering: "crisp-edges" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">Aarogya Assistant</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      <p className="text-xs text-slate-300">
                        Always here to help
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Location granted pill */}
              <AnimatePresence>
                {locationStatus === "granted" && coords && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-green-50 border-b border-green-100 px-4 py-2 flex items-center gap-2 overflow-hidden"
                  >
                    <MapPin className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-green-700">
                      Location active · {coords.lat.toFixed(4)},{" "}
                      {coords.lon.toFixed(4)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {!historyLoaded && (
                  <div className="flex justify-center items-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 0.1, 0.2].map((d, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${d}s` }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        Loading conversation...
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900 shadow-sm border border-slate-200"
                        }`}
                      >
                        {/* ── Markdown renderer for bot, plain text for user ── */}
                        {message.sender === "bot" ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="text-sm text-slate-800 leading-relaxed mb-1 last:mb-0">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-slate-900">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-slate-600">
                                  {children}
                                </em>
                              ),
                              ul: ({ children }) => (
                                <ul className="text-sm text-slate-800 list-disc pl-4 my-1 space-y-0.5">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="text-sm text-slate-800 list-decimal pl-4 my-1 space-y-0.5">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-sm text-slate-800 leading-relaxed">
                                  {children}
                                </li>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-base font-bold text-slate-900 mb-1 mt-2 first:mt-0">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-sm font-bold text-slate-900 mb-1 mt-2 first:mt-0">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold text-slate-900 mb-0.5 mt-1.5 first:mt-0">
                                  {children}
                                </h3>
                              ),
                              code: ({ children }) => (
                                <code className="text-xs bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">
                                  {children}
                                </code>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-2 border-slate-300 pl-3 my-1 text-slate-600 italic">
                                  {children}
                                </blockquote>
                              ),
                              hr: () => (
                                <hr className="border-slate-200 my-2" />
                              ),
                            }}
                          >
                            {normalizeMarkdown(message.text)}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">
                            {message.text}
                          </p>
                        )}

                        <p className="text-xs mt-1 text-slate-400">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* ── Location action card ──────────────────────────────── */}
                    {message.showLocationButton && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 ml-1 mr-6"
                      >
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4.5 h-4.5 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">
                                Allow location access
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Your browser will ask for permission. Location
                                is used only to find nearby doctors.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={handleShareLocation}
                            disabled={locationStatus === "requesting"}
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                          >
                            {locationStatus === "requesting" ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Getting location...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-4 h-4" />
                                Share my location
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setMessages((prev) =>
                                prev.map((m) =>
                                  m.showLocationButton
                                    ? { ...m, showLocationButton: false }
                                    : m,
                                ),
                              );
                              appendBotMessage(
                                "No problem! You can search by specialization instead.",
                                [
                                  "Find cardiologist",
                                  "Find dermatologist",
                                  "Show all doctors",
                                ],
                              );
                            }}
                            className="mt-2 w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
                          >
                            Skip — search by specialization instead
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Suggestion chips */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 ml-2">
                        {message.suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(s)}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-full text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                      <div className="flex gap-1">
                        {[0, 0.15, 0.3].map((d, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${d}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-slate-200 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholderTexts[placeholderIndex]}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all text-slate-900 placeholder-slate-500 text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
