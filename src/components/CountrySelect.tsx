"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

export function CountrySelect({ name = "country", required = false }: { name?: string, required?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = COUNTRIES.find(c => c.code === selected);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={selected} required={required} />
      
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="input flex items-center justify-between bg-white dark:bg-ink-900 w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {selectedCountry ? (
          <span className="flex items-center gap-2 truncate">
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="truncate">{selectedCountry.name}</span>
          </span>
        ) : (
          <span className="text-ink-400">Select your country</span>
        )}
        <span className="flex items-center gap-2 flex-shrink-0">
          {selectedCountry && <span className="text-xs font-mono font-bold text-ink-400 dark:text-ink-500 bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded mr-1">{selectedCountry.code}</span>}
          <ChevronDown className="w-5 h-5 text-ink-400" />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border-2 border-ink-200 bg-white p-2 shadow-xl dark:border-ink-700 dark:bg-ink-900 animate-slide-up">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-2 border-ink-200 bg-ink-50 py-2 pl-9 pr-3 text-sm focus:border-brand-300 focus:bg-brand-50 focus:outline-none dark:border-ink-700 dark:bg-ink-800 dark:focus:border-brand-700 dark:focus:bg-ink-900"
            />
          </div>
          
          <ul className="max-h-60 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <li className="py-4 text-center text-sm text-ink-500">No countries found</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(c.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-all hover:bg-ink-100 dark:hover:bg-ink-800 ${selected === c.code ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300" : ""}`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-xl">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-ink-400 dark:text-ink-500 bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded">{c.code}</span>
                      {selected === c.code && <Check className="w-4 h-4" />}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
