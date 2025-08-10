import React from 'react';
import { Header as BaseHeader } from '../ui';

export default function Header({ title }: { title: string }) {
  return <BaseHeader title={title} />;
}
