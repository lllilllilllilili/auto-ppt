"use client";

interface BulletListProps {
  bullets: string[];
  onChange: (bullets: string[]) => void;
  placeholder?: string;
}

export default function BulletList({ bullets, onChange, placeholder = "내용 입력" }: BulletListProps) {
  const update = (index: number, value: string) => {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
  };

  const remove = (index: number) => {
    if (bullets.length <= 1) return;
    onChange(bullets.filter((_, i) => i !== index));
  };

  const add = () => onChange([...bullets, ""]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && bullets[index] === "" && bullets.length > 1) {
      e.preventDefault();
      remove(index);
    }
  };

  return (
    <div className="space-y-2">
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-zinc-400 text-sm select-none">●</span>
          <input
            type="text"
            value={b}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder={`${placeholder} ${i + 1}`}
            className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
          />
          {bullets.length > 1 && (
            <button
              onClick={() => remove(i)}
              className="text-zinc-300 hover:text-red-400 transition text-lg leading-none"
              title="삭제"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={add}
        className="text-sm text-zinc-400 hover:text-blue-500 transition pl-5"
      >
        + 항목 추가
      </button>
    </div>
  );
}
