import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./lib/auth";

describe("App shell & auth flow", () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the sign in screen initially when not authenticated", () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByRole("heading", { name: "Sign In (Dev Mode)" })).toBeInTheDocument();
  });

  it("logs in as student and renders StudentDashboard inside Shell", async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    const uidInput = screen.getByLabelText("User ID");
    const roleSelect = screen.getByLabelText("Role");
    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(uidInput, { target: { value: "s-1" } });
    fireEvent.change(roleSelect, { target: { value: "student" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("TeamForge")).toBeInTheDocument();
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  it("logs in as lecturer and renders LecturerDashboard inside Shell", async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    const uidInput = screen.getByLabelText("User ID");
    const roleSelect = screen.getByLabelText("Role");
    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(uidInput, { target: { value: "lec-1" } });
    fireEvent.change(roleSelect, { target: { value: "lecturer" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("TeamForge")).toBeInTheDocument();
    expect(screen.getByText("Total Students")).toBeInTheDocument();
  });
});
