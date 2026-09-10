"use client";

import { useState } from "react";
import { loginSchema } from "schemas";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      setErrorMsg(parsed.error.errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      // Send credentials to Better Auth (adjust the URL if your mount point differs)
      const res = await fetch("http://localhost:3001/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        credentials: "include", // This ensures the session cookie is saved in the browser!
      });

      if (!res.ok) throw new Error("Invalid credentials");

      // Redirect to the protected dashboard on success
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg("Failed to sign in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-md mx-auto">
      <div className="mb-6 text-right">
        <a href="/login" className="text-blue-600 hover:underline">
          Owner Sign In
        </a>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-8 p-6 border rounded shadow-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-2">Sign In</h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          required
        />

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}
