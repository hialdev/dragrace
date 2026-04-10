"use client";

import { create } from "zustand";

interface TeamState {
  teamId: string | null;
  teamName: string | null;
  hasTeam: boolean;
  setTeam: (id: string, name: string) => void;
  clearTeam: () => void;
}

export const useTeamStore = create<TeamState>()((set) => ({
  teamId: null,
  teamName: null,
  hasTeam: false,
  setTeam: (id, name) => set({ teamId: id, teamName: name, hasTeam: true }),
  clearTeam: () => set({ teamId: null, teamName: null, hasTeam: false }),
}));

interface OrderState {
  orders: any[];
  selectedOrderId: string | null;
  isLocked: boolean;
  setOrders: (orders: any[]) => void;
  setSelectedOrder: (id: string, locked: boolean) => void;
  setLocked: (orderId: string, locked: boolean) => void;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  selectedOrderId: null,
  isLocked: false,
  setOrders: (orders) => set({ orders }),
  setSelectedOrder: (id, locked) => set({ selectedOrderId: id, isLocked: locked }),
  setLocked: (orderId, locked) => {
    const { orders } = get();
    set({
      orders: orders.map((o) => (o.id === orderId ? { ...o, is_locked: locked } : o)),
      isLocked: get().selectedOrderId === orderId ? locked : get().isLocked,
    });
  },
}));
