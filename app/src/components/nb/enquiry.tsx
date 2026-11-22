import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { SERVICE_NAMES, waLink } from "../../data/site";
import { Close, WhatsApp } from "./icons";

type Ctx = { open: (service?: string) => void };
const EnquiryCtx = createContext<Ctx>({ open: () => {} });
export const useEnquiry = () => useContext(EnquiryCtx);

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [service, setService] = useState("");
  const open = useCallback((s?: string) => {
    setService(s ?? "");
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  return (
    <EnquiryCtx.Provider value={{ open }}>
      {children}
      {isOpen ? <EnquiryDialog initialService={service} onClose={close} /> : null}
    </EnquiryCtx.Provider>
  );
}

/** Anchor that is a plain WhatsApp link, upgraded to the enquiry dialog when JS is running. */
export function Cta({
  service,
  className,
  children,
}: {
  service?: string;
  className?: string;
  children: ReactNode;
}) {
  const { open } = useEnquiry();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    open(service);
  };
  return (
    <a
      href={waLink({ service })}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

function EnquiryDialog({ initialService, onClose }: { initialService: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [service, setService] = useState(initialService);
  const [details, setDetails] = useState("");
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    window.open(waLink({ name, service, details }), "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="dlg-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-title" onSubmit={submit}>
        <button type="button" className="dlg-x" onClick={onClose} aria-label="Close">
          <Close />
        </button>
        <h3 id="dlg-title">
          Let's talk on <em>WhatsApp</em>
        </h3>
        <p className="dlg-sub">Tell me a little about your project. You can review and edit the message in WhatsApp before sending it.</p>
        <label>
          Your name
          <input ref={first} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required />
        </label>
        <label>
          Service
          <select value={service} onChange={(e) => setService(e.target.value)} required>
            <option value="" disabled>
              Select a service
            </option>
            {SERVICE_NAMES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project details
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Briefly describe your project and requirements." />
        </label>
        <button type="submit" className="btn btn-blue block">
          <WhatsApp /> Continue on WhatsApp
        </button>
      </form>
    </div>
  );
}
