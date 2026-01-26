import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SeveritySelect } from '@/components/severity/SeveritySelect';
import { toResourceName } from '@/lib/utils';
import type { IncidentLabel } from '@/types/api';
import { Plus, X } from 'lucide-react';

export interface IncidentFormData {
  name: string;
  title: string;
  severityRef?: string;
  summary?: string;
  isDrill?: boolean;
  labels?: IncidentLabel[];
}

export interface IncidentFormProps {
  /** Initial data for editing an existing incident */
  initialData?: Partial<IncidentFormData>;
  /** Callback when form is submitted */
  onSubmit: (data: IncidentFormData) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Whether the form is in a submitting state */
  isSubmitting?: boolean;
  /** Whether this is editing an existing incident (disables name field) */
  isEditing?: boolean;
}

/**
 * Form for creating or editing an incident.
 */
export function IncidentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing,
}: IncidentFormProps) {
  const [title, setTitle] = React.useState(initialData?.title || '');
  const [name, setName] = React.useState(initialData?.name || '');
  const [severityRef, setSeverityRef] = React.useState(initialData?.severityRef || '');
  const [summary, setSummary] = React.useState(initialData?.summary || '');
  const [isDrill, setIsDrill] = React.useState(initialData?.isDrill || false);
  const [labels, setLabels] = React.useState<IncidentLabel[]>(initialData?.labels || []);
  const [newLabelKey, setNewLabelKey] = React.useState('');
  const [newLabelValue, setNewLabelValue] = React.useState('');

  // Auto-generate name from title if not editing
  React.useEffect(() => {
    if (!isEditing && title && !initialData?.name) {
      setName(toResourceName(title));
    }
  }, [title, isEditing, initialData?.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      title,
      severityRef: severityRef || undefined,
      summary: summary || undefined,
      isDrill,
      labels: labels.length > 0 ? labels : undefined,
    });
  };

  const addLabel = () => {
    if (newLabelKey && newLabelValue) {
      setLabels([...labels, { key: newLabelKey, value: newLabelValue }]);
      setNewLabelKey('');
      setNewLabelValue('');
    }
  };

  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="incidents-space-y-4">
      {/* Title */}
      <div className="incidents-space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of the incident"
          required
        />
      </div>

      {/* Name (resource name) */}
      <div className="incidents-space-y-2">
        <Label htmlFor="name">Resource Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(toResourceName(e.target.value))}
          placeholder="incident-name"
          disabled={isEditing}
          required
        />
        <p className="incidents-text-xs incidents-text-muted-foreground">
          Kubernetes resource name (auto-generated from title)
        </p>
      </div>

      {/* Severity */}
      <div className="incidents-space-y-2">
        <Label htmlFor="severity">Severity</Label>
        <SeveritySelect
          value={severityRef}
          onValueChange={setSeverityRef}
          placeholder="Select severity level..."
        />
      </div>

      {/* Summary */}
      <div className="incidents-space-y-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Detailed description of the incident..."
          rows={3}
        />
      </div>

      {/* Is Drill */}
      <div className="incidents-flex incidents-items-center incidents-space-x-2">
        <Checkbox
          id="isDrill"
          checked={isDrill}
          onCheckedChange={(checked) => setIsDrill(checked === true)}
        />
        <Label htmlFor="isDrill" className="incidents-font-normal">
          This is a drill/practice incident
        </Label>
      </div>

      {/* Labels */}
      <div className="incidents-space-y-2">
        <Label>Labels</Label>
        <div className="incidents-space-y-2">
          {labels.map((label, index) => (
            <div key={index} className="incidents-flex incidents-items-center incidents-gap-2">
              <Input value={label.key} disabled className="incidents-flex-1" />
              <span className="incidents-text-muted-foreground">:</span>
              <Input value={label.value} disabled className="incidents-flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLabel(index)}
              >
                <X className="incidents-h-4 incidents-w-4" />
              </Button>
            </div>
          ))}
          <div className="incidents-flex incidents-items-center incidents-gap-2">
            <Input
              value={newLabelKey}
              onChange={(e) => setNewLabelKey(e.target.value)}
              placeholder="Key"
              className="incidents-flex-1"
            />
            <span className="incidents-text-muted-foreground">:</span>
            <Input
              value={newLabelValue}
              onChange={(e) => setNewLabelValue(e.target.value)}
              placeholder="Value"
              className="incidents-flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addLabel}
              disabled={!newLabelKey || !newLabelValue}
            >
              <Plus className="incidents-h-4 incidents-w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="incidents-flex incidents-justify-end incidents-gap-2 incidents-pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !title || !name}>
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Incident' : 'Create Incident'}
        </Button>
      </div>
    </form>
  );
}
