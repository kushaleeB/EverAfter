import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirementsProps {
  password: string;
}

const requirements = [
  { key: 'length', label: '8+ characters', test: (p: string) => p.length >= 8 },
  { key: 'upper', label: '1 uppercase', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'number', label: '1 number', test: (p: string) => /[0-9]/.test(p) },
  { key: 'special', label: '1 special char', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
      {requirements.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <li key={key} className="flex items-center gap-2">
            <Check
              className={cn(
                'h-3.5 w-3.5 shrink-0',
                met ? 'text-[#705639]' : 'text-[#d9cfc6]',
              )}
              strokeWidth={2}
            />
            <span
              className={cn(
                'font-body text-xs',
                met ? 'text-[#4e342e]' : 'text-[#9e8e82]',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function isPasswordValid(password: string) {
  const uiValid = requirements.every(({ test }) => test(password));
  return uiValid && /[a-z]/.test(password);
}
