import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSeverities } from '@/api/queries';
import { SeverityBadge } from './SeverityBadge';

export interface SeveritySelectProps {
  /** Current selected severity name */
  value?: string;
  /** Callback when severity changes */
  onValueChange?: (value: string) => void;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Dropdown select for choosing a severity level.
 * Fetches available severities from the API and displays them sorted by order.
 */
export function SeveritySelect({
  value,
  onValueChange,
  placeholder = 'Select severity...',
  disabled,
  className,
}: SeveritySelectProps) {
  const { data: severitiesData, isLoading } = useSeverities();

  // Sort severities by order (lower = more severe = first)
  const sortedSeverities = React.useMemo(() => {
    if (!severitiesData?.items) return [];
    return [...severitiesData.items].sort(
      (a, b) => (a.spec.order ?? 0) - (b.spec.order ?? 0)
    );
  }, [severitiesData]);

  const selectedSeverity = sortedSeverities.find((s) => s.metadata.name === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled || isLoading}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedSeverity ? (
            <SeverityBadge severity={selectedSeverity} />
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortedSeverities.map((severity) => (
          <SelectItem key={severity.metadata.name} value={severity.metadata.name}>
            <div className="incidents-flex incidents-items-center incidents-gap-2">
              <SeverityBadge severity={severity} />
              {severity.spec.description && (
                <span className="incidents-text-xs incidents-text-muted-foreground incidents-truncate incidents-max-w-[200px]">
                  {severity.spec.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
        {sortedSeverities.length === 0 && !isLoading && (
          <div className="incidents-py-2 incidents-px-3 incidents-text-sm incidents-text-muted-foreground">
            No severities configured
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
