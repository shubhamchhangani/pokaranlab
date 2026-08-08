"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "@/lib/actions/auth";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: LoginState = { status: "idle" };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-brand-indigo p-6">
      <form
        action={formAction}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-8"
      >
        <h1 className="font-display text-xl font-semibold text-brand-indigo">
          Pokaran Lab — Staff Login
        </h1>

        <FormField label="Email" htmlFor="email">
          <input id="email" name="email" type="email" required className={inputClasses} />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <input
            id="password"
            name="password"
            type="password"
            required
            className={inputClasses}
          />
        </FormField>

        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
