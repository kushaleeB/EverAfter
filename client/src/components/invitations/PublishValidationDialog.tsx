import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { ValidationIssue } from '@/lib/invitationValidation';
import { groupValidationIssuesBySection } from '@/lib/invitationValidation';
import { cn } from '@/lib/utils';

interface PublishValidationDialogProps {
  open: boolean;
  issues: ValidationIssue[];
  onClose: () => void;
  onSelectIssue: (issue: ValidationIssue) => void;
}

export function PublishValidationDialog({
  open,
  issues,
  onClose,
  onSelectIssue,
}: PublishValidationDialogProps) {
  if (!open) return null;

  const grouped = groupValidationIssuesBySection(issues);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-[#1f1b18]/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e8dfd6] bg-[#faf9f6] shadow-[0_24px_64px_rgba(78,52,46,0.18)]"
        role="dialog"
        aria-modal
        aria-labelledby="publish-validation-title"
      >
        <div className="border-b border-[#e8dfd6] bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-[#c5a67c]">
                Publish blocked
              </p>
              <h2 id="publish-validation-title" className="mt-1 font-display text-xl text-[#4e342e]">
                Cannot publish invitation
              </h2>
              <p className="mt-2 font-body text-sm text-[#6d625a]">
                Complete the required fields below, then try publishing again.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-[#9e8e82] transition-colors hover:bg-[#faf7f2] hover:text-[#4e342e]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {Array.from(grouped.entries()).map(([sectionLabel, sectionIssues]) => (
              <div key={sectionLabel}>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-[#6d625a]">
                  {sectionLabel}
                </p>
                <ul className="mt-2 space-y-1">
                  {sectionIssues.map((issue) => (
                    <li key={issue.id}>
                      <button
                        type="button"
                        onClick={() => onSelectIssue(issue)}
                        className="group flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white hover:shadow-[0_4px_16px_rgba(78,52,46,0.06)]"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#c5a67c]" aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="font-body text-sm font-medium text-[#4e342e] group-hover:text-[#c5a67c]">
                            {issue.fieldLabel}
                          </span>
                          <span className="mt-0.5 block font-body text-xs text-[#9e8e82]">{issue.message}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e8dfd6] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#4e342e] py-2.5 font-body text-sm font-semibold text-white transition-colors hover:bg-[#3e2723]"
          >
            Continue editing
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditorFieldProps {
  label: string;
  error?: string;
  showValidation?: boolean;
  fieldId?: string;
  children: ReactNode;
}

export function EditorField({ label, error, showValidation, fieldId, children }: EditorFieldProps) {
  const hasError = Boolean(showValidation && error);

  return (
    <div data-validation-field={fieldId}>
      <label className="font-body text-xs text-[#6d625a]">{label}</label>
      <div
        className={cn(
          'mt-1.5',
          hasError && '[&_input]:border-red-400 [&_input]:focus:border-red-500 [&_select]:border-red-400 [&_textarea]:border-red-400',
        )}
      >
        {children}
      </div>
      {hasError && error && (
        <p className="mt-1 font-body text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function EditorValidationBanner({
  message,
  variant = 'error',
}: {
  message: string;
  variant?: 'error' | 'success';
}) {
  return (
    <div
      className={cn(
        'rounded-xl px-3 py-2 font-body text-xs',
        variant === 'error' ? 'bg-red-50 text-red-700' : 'bg-[#e8f5e9] text-[#2e7d32]',
      )}
      role="status"
    >
      {message}
    </div>
  );
}
