import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-6 flex flex-col items-center gap-2">
        <Image
          src="/mascot/wave.png"
          alt="Vocaa owl"
          width={80}
          height={80}
          className="mascot drop-shadow-lg"
        />
        <span className="text-2xl font-black tracking-tight text-brand-500">Vocaa</span>
      </Link>
      <div className="card-fun w-full max-w-md border-2 border-ink-200 dark:border-ink-700">
        {children}
      </div>
    </main>
  );
}
