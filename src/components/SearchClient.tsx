// src/components/SearchClient.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Copy, Check, Moon, Sun, Keyboard } from "lucide-react";
import "./SearchClient.css";

interface Icon {
  name: string;
  import_path: string;
  provider: string;
  module?: string;
  // Aliases removed from interface as requested
  docstring?: string;
}

interface SearchClientProps {
  icons: Icon[];
}

export default function SearchClient({ icons }: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const inputRef = useRef<HTMLInputElement>(null);
  const lastEscapeTime = useRef<number>(0);

  // Initialize Theme
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  // Update HTML attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K to Focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Double Escape to Clear
      if (e.key === "Escape") {
        const now = Date.now();
        if (now - lastEscapeTime.current < 300) {
          // Double press detected (within 300ms)
          setQuery("");
          inputRef.current?.blur();
        }
        lastEscapeTime.current = now;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim() && !showAll) return [];
    const lowerQuery = query.toLowerCase();

    // Removed Alias search logic
    return icons.filter((icon) => {
      return (
        icon.name.toLowerCase().includes(lowerQuery) ||
        icon.import_path.toLowerCase().includes(lowerQuery)
      );
    });
  }, [query, showAll, icons]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getImportParts = (icon: Icon) => {
    const parts = icon.import_path.split(".");
    const className = parts[parts.length - 1];
    const modulePath = parts.slice(0, -1).join(".");
    return { className, modulePath };
  };

  const normalizeProvider = (p: string) => {
    if (p.includes("aws")) return "aws";
    if (p.includes("azure")) return "azure";
    if (p.includes("gcp") || p.includes("google")) return "gcp";
    if (p.includes("k8s") || p.includes("kubernetes")) return "k8s";
    if (p.includes("alibaba")) return "alibabacloud";
    return "default";
  };

  const hasResults = filtered.length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="search-container">
      {/* Text-based Theme Toggle */}
      <button className="theme-toggle-btn" onClick={toggleTheme}>
        {theme === "light" ? (
          <>
            <Moon size={16} /> <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={16} /> <span>Light Mode</span>
          </>
        )}
      </button>

      <header className="header-hero">
        <h1 className="hero-title">Search the Icons</h1>
        <p className="hero-subtitle">
          A searchable interface for all architecture icons from{" "}
          <a
            href="https://diagrams.mingrammer.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-link"
          >
            diagrams.mingrammer.com
          </a>
        </p>
      </header>

      <div className="search-sticky-wrapper">
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search providers... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="search-actions">
            {query && (
              <button
                className="clear-btn"
                onClick={() => setQuery("")}
                title="Double Esc to clear"
              >
                <X size={16} />
              </button>
            )}
            {!isSearching && (
              <button
                className={`show-all-toggle ${showAll ? "active" : ""}`}
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Hide All" : "Browse All"}
              </button>
            )}
          </div>
        </div>

        {hasResults && (
          <div className="results-count-badge">
            Showing {filtered.length} icons
          </div>
        )}
      </div>

      <main className="results-section">
        {hasResults ? (
          <div className="results-grid">
            {filtered.map((icon, idx) => {
              const { className, modulePath } = getImportParts(icon);
              const fullImport = `from ${modulePath} import ${className}`;
              const copyId = `card-${idx}`;
              const pathId = `path-${idx}`;

              return (
                <article key={idx} className="icon-card">
                  <div className="card-header">
                    <div className="card-titles">
                      <h3>{icon.name}</h3>
                      <div
                        className="full-path-text"
                        onClick={() =>
                          copyToClipboard(icon.import_path, pathId)
                        }
                        title="Click to copy full path"
                      >
                        {icon.import_path}
                        {copied === pathId && (
                          <span className="path-copied-msg">Copied!</span>
                        )}
                      </div>
                    </div>
                    <span
                      className="provider-badge"
                      data-provider={normalizeProvider(icon.provider)}
                    >
                      {icon.provider}
                    </span>
                  </div>

                  <div className="code-display">
                    <div className="code-content">
                      <span className="keyword">from</span>{" "}
                      <span className="module">{modulePath}</span>{" "}
                      <span className="keyword">import</span>{" "}
                      <span className="class-name">{className}</span>
                    </div>
                    <button
                      className={`copy-action ${
                        copied === copyId ? "copied" : ""
                      }`}
                      onClick={() => copyToClipboard(fullImport, copyId)}
                      title="Copy Import"
                    >
                      {copied === copyId ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  {/* Aliases Footer Removed completely */}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              {isSearching ? (
                <Search size={48} strokeWidth={1.5} />
              ) : (
                <Keyboard size={48} strokeWidth={1.5} />
              )}
            </div>
            <h3>
              {isSearching ? "No results found" : "Start typing to search"}
            </h3>
            <p>
              {isSearching
                ? "Try a different search term."
                : "Press Cmd+K to focus."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
