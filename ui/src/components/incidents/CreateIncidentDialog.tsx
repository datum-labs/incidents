import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IncidentForm, type IncidentFormData } from './IncidentForm';
import { useCreateIncident } from '@/api/queries';
import { Plus } from 'lucide-react';

export interface CreateIncidentDialogProps {
  /** Callback when incident is successfully created */
  onCreated?: (incidentName: string) => void;
  /** Custom trigger element (defaults to a button) */
  trigger?: React.ReactNode;
  /** Whether the dialog is controlled externally */
  open?: boolean;
  /** Callback when open state changes (for controlled mode) */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dialog for creating a new incident.
 */
export function CreateIncidentDialog({
  onCreated,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateIncidentDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const createIncident = useCreateIncident();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleSubmit = async (data: IncidentFormData) => {
    try {
      await createIncident.mutateAsync({
        metadata: {
          name: data.name,
        },
        spec: {
          title: data.title,
          severityRef: data.severityRef,
          summary: data.summary,
          isDrill: data.isDrill,
          labels: data.labels,
        },
      });

      setOpen(false);
      onCreated?.(data.name);
    } catch (error) {
      // Error is handled by React Query
      console.error('Failed to create incident:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="incidents-h-4 incidents-w-4 incidents-mr-2" />
            Create Incident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="incidents-max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
          <DialogDescription>
            Create a new incident to track and manage an ongoing issue.
          </DialogDescription>
        </DialogHeader>
        <IncidentForm
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createIncident.isPending}
        />
        {createIncident.isError && (
          <p className="incidents-text-sm incidents-text-destructive incidents-mt-2">
            Failed to create incident: {(createIncident.error as Error).message}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
