import Link from 'next/link';
import '../styles/main.css';

const Navbar = () => {
  return (
    <nav className="relative mx-8 flex justify-center p-6">
      <div className="flex items-center space-x-16">
        <div className="flex items-center space-x-2">
          {/* Reduced space between the logo and the title */}
          <svg
            width="65"
            height="60"
            viewBox="0 0 59 53"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M40.8225 11.9603V0H40.8243L54.068 17.4184L46.9231 23.0816C47.104 23.9042 47.2388 24.7441 47.3266 25.5971C47.404 26.364 47.444 27.1405 47.444 27.9275C47.444 28.4048 47.4292 28.8787 47.3988 29.3483C46.6675 41.1495 36.8653 50.4925 24.8798 50.4925C22.4573 50.4925 20.1261 50.1065 17.9392 49.4004L0 52.5412L16.5349 36.2471L40.8225 11.9603ZM54.6585 27.624V19.8409L59 23.2824L54.6585 27.624Z"
              fill="#D51E3E"
            />
          </svg>
          <h1 className="text-white text-2xl font-bold">Card Software</h1>
        </div>
        <Link href="#" className="text-lg text-white">
          About CS Tracer
        </Link>
        <Link href="#" className="text-lg text-white">
          Tier System
        </Link>
        <Link href="#" className="text-lg text-white">
          Features
        </Link>
        <Link href="#" className="text-lg text-white">
          How It Works
        </Link>
        <Link href="#" className="text-lg font-bold text-white">
          Log In
        </Link>
        <Link href="#">
          <button
            className="rounded-full px-6 py-3 text-xl text-white transition hover:bg-gray-300"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            Request a Demo
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
