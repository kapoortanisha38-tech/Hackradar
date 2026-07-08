"use client";

import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from "firebase/auth";
import { auth, provider } from "../firebase";

type LoginButtonProps = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export default function LoginButton({ user, setUser }: LoginButtonProps) {
  async function handleLogin() {
  const isMobile =
    typeof window !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    await signInWithRedirect(auth, provider);
    return;
  }

  const result = await signInWithPopup(auth, provider);
  setUser(result.user);
}

  async function handleLogout() {
    await signOut(auth);
    setUser(null);
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="rounded-xl bg-red-500 px-4 py-2 font-semibold text-white"
      >
        Logout
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-black"
    >
      Continue with Google
    </button>
  );
}