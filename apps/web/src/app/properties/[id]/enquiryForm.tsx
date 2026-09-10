"use client";

import { useState } from "react";
import { createEnquirySchema } from "schemas";

export default function EnquiryForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // 1. Enforce the contract on the client!
    const parsed = createEnquirySchema.safeParse(rawData);
    if (!parsed.success) {
      setStatus("error");
      setErrorMsg(parsed.error.errors[0].message);
      return;
    }

    // 2. Send to your Elysia API
    try {
      const res = await fetch(`http://localhost:3001/properties/${propertyId}/enquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) throw new Error("API rejected the enquiry");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Failed to send enquiry. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded">Enquiry sent successfully!</div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-4 border rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Send an Enquiry</h3>

      <div className="flex flex-col gap-3">
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          className="border p-2 rounded"
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          className="border p-2 rounded"
          required
        />
        <textarea
          name="message"
          placeholder="I'm interested in..."
          className="border p-2 rounded"
          required
        ></textarea>

        {status === "error" && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {status === "loading" ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
