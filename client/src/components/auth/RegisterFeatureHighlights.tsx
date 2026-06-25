import { CheckCheck, Mail, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const features: Array<{
  icon: LucideIcon;
  lines: [string, string];
  iconBg: string;
}> = [
  {
    icon: Mail,
    lines: ['Beautiful', 'Invitations'],
    iconBg: 'bg-[#f5ebe3]',
  },
  {
    icon: CheckCheck,
    lines: ['Smart RSVP', 'Tracking'],
    iconBg: 'bg-[#f9f0ee]',
  },
  {
    icon: Users,
    lines: ['Guest', 'Management'],
    iconBg: 'bg-[#f3eeec]',
  },
];

export function RegisterFeatureHighlights() {
  return (
    <div className="grid grid-cols-3 gap-6 pb-2 pt-4">
      {features.map(({ icon: Icon, lines, iconBg }) => (
        <div key={lines.join('-')} className="flex flex-col items-center text-center">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className="h-5 w-5 text-[#6d625a]" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-body text-xs leading-snug text-[#5c534c]">
            {lines[0]}
            <br />
            {lines[1]}
          </p>
        </div>
      ))}
    </div>
  );
}
