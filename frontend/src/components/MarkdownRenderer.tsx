import React from 'react';

interface MarkdownRendererProps {
  content: string;
  onToggleCheckbox?: (lineIndex: number, newChecked: boolean) => void;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onToggleCheckbox,
  className = '',
}) => {
  if (!content) return null;

  const lines = content.split('\n');

  const renderInline = (text: string) => {
    // Basic inline formatting: code, bold, italic, strikethrough, links
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g);

    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={idx} className="font-mono text-xs px-1.5 py-0.5 rounded bg-black/10 text-slate-900">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('~~') && part.endsWith('~~') && part.length > 4) {
        return (
          <span key={idx} className="line-through text-slate-400">
            {part.slice(2, -2)}
          </span>
        );
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-amber-800 hover:text-amber-950 underline underline-offset-2 font-medium"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-1 text-sm font-sans leading-relaxed text-slate-800 break-words ${className}`}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 1. Checklist / Task item: "- [ ] " or "- [x] "
        const checkMatch = line.match(/^(\s*[-*]\s*\[([ xX])\]\s*)(.*)$/);
        if (checkMatch) {
          const isChecked = checkMatch[2].toLowerCase() === 'x';
          const taskText = checkMatch[3];
          return (
            <div
              key={index}
              onClick={(e) => {
                if (onToggleCheckbox) {
                  e.stopPropagation();
                  onToggleCheckbox(index, !isChecked);
                }
              }}
              className="flex items-start gap-2 group/check py-0.5 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-amber-600 focus:ring-0 cursor-pointer pointer-events-none"
              />
              <span className={isChecked ? 'line-through text-slate-400' : 'text-slate-800'}>
                {renderInline(taskText)}
              </span>
            </div>
          );
        }

        // 2. Headings: "# ", "## ", "### "
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} className="font-serif font-bold text-base text-slate-900 pt-1">
              {renderInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={index} className="font-serif font-bold text-lg text-slate-900 pt-1.5">
              {renderInline(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={index} className="font-serif font-bold text-xl text-slate-900 pt-2">
              {renderInline(trimmed.slice(2))}
            </h2>
          );
        }

        // 3. Bullet lists: "- " or "* "
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="text-slate-400 mt-1">•</span>
              <span className="flex-1">{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        // 4. Blockquotes: "> "
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-2 border-amber-400/80 pl-3 italic text-slate-600 my-1">
              {renderInline(trimmed.slice(2))}
            </blockquote>
          );
        }

        // 5. Blank line
        if (!trimmed) {
          return <div key={index} className="h-1.5" />;
        }

        // 6. Regular text line
        return <p key={index}>{renderInline(line)}</p>;
      })}
    </div>
  );
};
