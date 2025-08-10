// src/components/Icon.tsx
import React from 'react';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';

type Props = {
  name: string;
  size?: number;
  color?: string;
  type?: 'material' | 'feather' | 'ion';
};

export default function Icon({ name, size = 24, color = '#000', type = 'material' }: Props) {
  switch (type) {
    case 'feather':
      return <Feather name={name as any} size={size} color={color} />;
    case 'ion':
      return <Ionicons name={name as any} size={size} color={color} />;
    default:
      return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
  }
}
