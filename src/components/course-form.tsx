"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Course, CourseInput } from "@/lib/types";

export function CourseForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Course;
  submitLabel: string;
  onSubmit: (input: CourseInput) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      await onSubmit({
        title: String(data.get("title") ?? "").trim(),
        description: String(data.get("description") ?? "").trim(),
        price: Number(data.get("price") ?? 0),
        videoUrl: String(data.get("videoUrl") ?? "").trim(),
        thumbnailUrl: String(data.get("thumbnailUrl") ?? "").trim(),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The course couldn’t be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>Course title</span>
        <input autoComplete="off" defaultValue={initial?.title} maxLength={160} name="title" required />
      </label>
      <label className="field">
        <span>Description</span>
        <textarea defaultValue={initial?.description} maxLength={1000} name="description" required rows={5} />
      </label>
      <label className="field">
        <span>Price</span>
        <input defaultValue={initial?.price ?? 0} min="0" name="price" required step="0.01" type="number" />
      </label>
      <label className="field">
        <span>Video URL</span>
        <input defaultValue={initial?.videoUrl ?? ""} name="videoUrl" type="url" />
      </label>
      <label className="field">
        <span>Thumbnail URL</span>
        <input defaultValue={initial?.thumbnailUrl ?? ""} name="thumbnailUrl" type="url" />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary" disabled={busy} type="submit">
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
