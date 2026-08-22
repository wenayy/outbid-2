import Image from "next/image";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center rounded-md border border-gh-green-bright/35 bg-gh-green/15 shadow-sm ${
        compact ? "h-8 w-[104px] px-1.5" : "h-9 w-[124px] px-2"
      }`}
    >
      <Image
        src="/gitflex-logo.png"
        width={2172}
        height={724}
        alt="GitFlex"
        className="h-auto w-full"
        priority={!compact}
      />
    </span>
  );
}
