/**
 * Slot Component - Renders content injected by themes
 *
 * Usage:
 * <Slot id={SLOTS['home.hero']} context={{ someData }} />
 */

import React from 'react';
import { View } from 'react-native';
import { useSlotRegistry } from '../registry/SlotRegistry';
import type { SlotId } from './slots';

export interface SlotProps {
  /** Slot identifier */
  id: SlotId;
  /** Context data passed to slot content components */
  context?: Record<string, any>;
  /** Fallback content when slot is empty */
  fallback?: React.ReactNode;
  /** Container style */
  style?: any;
}

export function Slot({ id, context = {}, fallback = null, style }: SlotProps) {
  const contents = useSlotRegistry((state) => state.getContents(id));

  if (contents.length === 0) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <View style={style}>
      {contents.map((content) => {
        const Component = content.component;
        return (
          <Component
            key={content.id}
            slotContext={context}
            {...content.props}
          />
        );
      })}
    </View>
  );
}

// Hook for checking if slot has content
export function useSlotHasContent(slotId: SlotId): boolean {
  return useSlotRegistry((state) => state.getContents(slotId).length > 0);
}
