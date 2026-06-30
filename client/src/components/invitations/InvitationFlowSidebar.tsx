import {
  BookOpen,
  Calendar,
  Camera,
  FileText,
  Mail,
  Plus,
} from 'lucide-react';
import type { InvitationSection, SectionType } from '@/types/api';
import { SECTION_FLOW_LABELS } from '@/lib/invitations';
import { cn } from '@/lib/utils';

const SECTION_ICONS: Partial<Record<SectionType, typeof FileText>> = {
  hero: FileText,
  story: BookOpen,
  schedule: Calendar,
  gallery: Camera,
  rsvp: Mail,
};

interface InvitationFlowSidebarProps {
  eventTitle: string;
  sections: InvitationSection[];
  activeSectionId: string | null;
  autosaveLabel: string;
  sectionsWithErrors?: Set<SectionType>;
  onSelectSection: (sectionId: string) => void;
}

export function InvitationFlowSidebar({
  eventTitle,
  sections,
  activeSectionId,
  autosaveLabel,
  sectionsWithErrors,
  onSelectSection,
}: InvitationFlowSidebarProps) {
  const visibleSections = [...sections]
    .filter((section) => section.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-[#e8dfd6] bg-white">
      <div className="border-b border-[#e8dfd6] px-4 py-5">
        <p className="font-display text-lg text-[#4e342e]">{eventTitle}</p>
        <p className="mt-1 font-body text-xs text-[#9e8e82]">{autosaveLabel}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9e8e82]">
          Invitation Flow
        </p>
        <nav className="mt-3 space-y-1" aria-label="Invitation flow">
          {visibleSections.map((section) => {
            const Icon = SECTION_ICONS[section.sectionType] ?? FileText;
            const isActive = section.id === activeSectionId;
            const hasError = sectionsWithErrors?.has(section.sectionType);

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelectSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left font-body text-sm transition-colors',
                  isActive
                    ? 'bg-[#faf7f2] font-medium text-[#4e342e]'
                    : 'text-[#6d625a] hover:bg-[#faf9f6] hover:text-[#4e342e]',
                  hasError && !isActive && 'border border-red-200/80 bg-red-50/40',
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#a1887f]" strokeWidth={1.5} />
                <span className="min-w-0 flex-1">{SECTION_FLOW_LABELS[section.sectionType]}</span>
                {hasError && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#c45c5c]" aria-label="Has validation errors" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[#e8dfd6] p-4">
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#e8dfd6] px-3 py-2.5 font-body text-sm text-[#9e8e82]"
        >
          <Plus className="h-4 w-4" />
          Add Page
        </button>
      </div>
    </aside>
  );
}
