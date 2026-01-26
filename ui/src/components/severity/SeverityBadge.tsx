import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { IncidentSeverity } from '@/types/api';

export interface SeverityBadgeProps {
  /** The severity object or just the display name */
  severity: IncidentSeverity | string;
  /** Optional custom color (overrides severity.spec.color) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Badge component that displays a severity level with appropriate styling.
 */
export function SeverityBadge({ severity, color, className }: SeverityBadgeProps) {
  const isObject = typeof severity === 'object';
  const displayName = isObject ? severity.spec.displayName : severity;
  const badgeColor = color || (isObject ? severity.spec.color : undefined);

  const style = badgeColor
    ? { backgroundColor: badgeColor, color: getContrastColor(badgeColor) }
    : undefined;

  return (
    <Badge
      variant={style ? undefined : 'secondary'}
      className={cn('incidents-font-medium', className)}
      style={style}
    >
      {displayName}
    </Badge>
  );
}

/**
 * Get a contrasting text color (black or white) based on background color.
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
