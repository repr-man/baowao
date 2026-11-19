import { toast } from "@solid2-aria/sonner";

export function notifyError(
  error: unknown,
  options?: { action?: { label: string; run: () => void } },
) {
  const message = error instanceof Error ? error.message : String(error);
  toast.error(message, {
    duration: Infinity,
    action: options?.action && {
      label: options.action.label,
      onClick: options.action.run,
    },
  });
}
