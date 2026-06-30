import { useEffect, useRef } from 'react';
import { Bold, Italic, List, Underline } from 'lucide-react';
import { stripHtml } from '@/lib/storySection';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  showCharacterCount?: boolean;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your love story...',
  showCharacterCount = true,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || isInternalChange.current) return;
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  function handleInput() {
    const editor = editorRef.current;
    if (!editor) return;
    isInternalChange.current = true;
    onChange(editor.innerHTML);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }

  const charCount = stripHtml(value).length;

  return (
    <div className="overflow-hidden rounded-xl border border-[#e8dfd6] bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-[#e8dfd6] px-2 py-1.5">
        {[
          { icon: Bold, command: 'bold', label: 'Bold' },
          { icon: Italic, command: 'italic', label: 'Italic' },
          { icon: Underline, command: 'underline', label: 'Underline' },
        ].map(({ icon: Icon, command, label }) => (
          <button
            key={command}
            type="button"
            aria-label={label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editorRef.current?.focus();
              exec(command);
              handleInput();
            }}
            className="rounded-md p-2 text-[#6d625a] hover:bg-[#faf7f2] hover:text-[#4e342e]"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          aria-label="Bullet list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            editorRef.current?.focus();
            exec('insertUnorderedList');
            handleInput();
          }}
          className="rounded-md p-2 text-[#6d625a] hover:bg-[#faf7f2] hover:text-[#4e342e]"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        onInput={handleInput}
        className={cn(
          'min-h-[140px] px-4 py-3 font-body text-sm leading-relaxed text-[#4e342e] outline-none',
          '[&:empty]:before:pointer-events-none [&:empty]:before:text-[#9e8e82] [&:empty]:before:content-[attr(data-placeholder)]',
          '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
          '[&_strong]:font-semibold',
        )}
      />

      {showCharacterCount && (
        <div className="border-t border-[#e8dfd6] px-4 py-2 text-right font-body text-xs text-[#9e8e82]">
          {charCount} characters
        </div>
      )}
    </div>
  );
}
