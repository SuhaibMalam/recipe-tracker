"use client";

import { useState } from "react";

const eye = (
  <>
    <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z" />
    <circle cx="10" cy="10" r="2.5" />
  </>
);

const eyeOff = (
  <>
    <path d="M8.2 4.2A8.4 8.4 0 0 1 10 4c5.5 0 8.5 6 8.5 6a14 14 0 0 1-2.1 2.9M5.4 5.4A13.6 13.6 0 0 0 1.5 10s3 6 8.5 6a8 8 0 0 0 4.6-1.4" />
    <path d="M8.2 8.2a2.5 2.5 0 0 0 3.6 3.6M2 2l16 16" />
  </>
);

// A password input with a show/hide toggle. Field renders this for type="password".
export default function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-11`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-ink-muted transition-colors hover:text-ink"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {visible ? eyeOff : eye}
        </svg>
      </button>
    </div>
  );
}
