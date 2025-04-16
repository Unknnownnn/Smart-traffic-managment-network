import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Network Simulation"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </Link>
          <nav className="ml-8 flex space-x-4">
            <Link href="/simulation" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Simulation
            </Link>
            <Link href="/analysis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Analysis
            </Link>
            <Link href="/visualization" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Visualization
            </Link>
            <Link href="/settings" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 