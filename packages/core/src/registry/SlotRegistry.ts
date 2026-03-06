/**
 * SlotRegistry - UI injection point system
 *
 * Allows themes to inject custom components at predefined
 * locations throughout the app.
 */

import { create } from 'zustand';
import type { ComponentType } from 'react';

export interface SlotContent {
  id: string;
  component: ComponentType<any>;
  priority: number;
  props?: Record<string, any>;
}

interface SlotRegistryState {
  slots: Map<string, SlotContent[]>;

  // Fill a slot with content
  fill: (
    slotId: string,
    component: ComponentType<any>,
    options?: { priority?: number; props?: Record<string, any>; id?: string }
  ) => void;

  // Get all contents for a slot (sorted by priority)
  getContents: (slotId: string) => SlotContent[];

  // Remove content from slot by id
  remove: (slotId: string, contentId: string) => void;

  // Clear all slots
  clear: () => void;

  // Clear specific slot
  clearSlot: (slotId: string) => void;
}

let contentIdCounter = 0;

export const useSlotRegistry = create<SlotRegistryState>((set, get) => ({
  slots: new Map(),

  fill: (slotId, component, options = {}) => {
    const { priority = 10, props, id } = options;
    const contentId = id || `slot-content-${++contentIdCounter}`;

    set((state) => {
      const newSlots = new Map(state.slots);
      const existing = newSlots.get(slotId) || [];

      const content: SlotContent = {
        id: contentId,
        component,
        priority,
        props,
      };

      // Add and sort by priority (lower = first)
      const updated = [...existing, content].sort((a, b) => a.priority - b.priority);
      newSlots.set(slotId, updated);

      return { slots: newSlots };
    });
  },

  getContents: (slotId) => {
    return get().slots.get(slotId) || [];
  },

  remove: (slotId, contentId) => {
    set((state) => {
      const newSlots = new Map(state.slots);
      const existing = newSlots.get(slotId) || [];
      newSlots.set(slotId, existing.filter((c) => c.id !== contentId));
      return { slots: newSlots };
    });
  },

  clear: () => {
    set({ slots: new Map() });
    contentIdCounter = 0;
  },

  clearSlot: (slotId) => {
    set((state) => {
      const newSlots = new Map(state.slots);
      newSlots.delete(slotId);
      return { slots: newSlots };
    });
  },
}));
