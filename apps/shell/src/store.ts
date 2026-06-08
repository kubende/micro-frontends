import { create } from "zustand";
import type {
  Entitlements,
  ModuleId,
  SessionUser,
  SubNavItem,
} from "@workspace/contracts";

type ActiveSubNav = {
  moduleId: ModuleId;
  /** Absolute base path the items should be resolved against, e.g. "/underwriting". */
  basePath: string;
  items: SubNavItem[];
};

type Session = {
  user: SessionUser | null;
  entitlements: Entitlements | null;
  activeSubNav: ActiveSubNav | null;
  setSession: (user: SessionUser, entitlements: Entitlements) => void;
  clear: () => void;
  isEntitled: (id: ModuleId) => boolean;
  setActiveSubNav: (value: ActiveSubNav) => void;
  clearActiveSubNav: (moduleId: ModuleId) => void;
};

export const useSession = create<Session>((set, get) => ({
  user: null,
  entitlements: null,
  activeSubNav: null,
  setSession: (user, entitlements) => set({ user, entitlements }),
  clear: () => set({ user: null, entitlements: null, activeSubNav: null }),
  isEntitled: (id) => !!get().entitlements?.modules.includes(id),
  setActiveSubNav: (value) => set({ activeSubNav: value }),
  // Only clear if the caller still "owns" the active slot — prevents a
  // racing unmount from a previous module wiping the new module's nav.
  clearActiveSubNav: (moduleId) =>
    set((s) =>
      s.activeSubNav?.moduleId === moduleId ? { activeSubNav: null } : s,
    ),
}));
