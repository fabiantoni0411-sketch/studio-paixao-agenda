import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full py-6 flex flex-col items-center bg-brand-gradient">
      <Link href="/" className="flex flex-col items-center">
        <Image src="/logo.png" alt="Studio Paixão" width={360} height={242} priority />
      </Link>
      <nav className="mt-4 flex gap-3">
        <Link href="/#servicos" className="text-sm font-semibold text-pink-700 hover:text-pink-900">
          Serviços
        </Link>
        <span className="text-pink-300">•</span>
        <Link href="/#galeria" className="text-sm font-semibold text-pink-700 hover:text-pink-900">
          Galeria
        </Link>
        <span className="text-pink-300">•</span>
        <Link href="/agendar" className="text-sm font-semibold text-pink-700 hover:text-pink-900">
          Agendar
        </Link>
      </nav>
    </header>
  );
}
