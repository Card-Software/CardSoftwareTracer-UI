// pages/about.tsx
import Navbar from '../components/landing-page-navbar';
import '../app/globals.css';
import Link from 'next/link';

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div
        className="relative flex min-h-screen flex-col"
        style={{
          backgroundImage: 'url(/landing-background.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>

        <Navbar />

        {/* General info Section */}
        <section className="relative flex-grow content-center py-12 text-center">
          <div>
            <h1 className="mb-6 text-6xl font-bold text-white">
              Connect Every Step.
            </h1>
            <h1 className="mb-6 text-6xl font-bold text-white">
              Track Every Tier.
            </h1>
            <h1 className="mb-8 text-6xl font-bold text-white">
              Transform Your Traceability.
            </h1>
          </div>
          <p className="mx-auto mb-8 max-w-4xl text-xl text-white">
            With CS Tracer, see the entire production process from raw materials
            to retail, ensuring transparency, compliance, and seamless
            collaboration across every tier.
          </p>
          <div className="space-x-16">
            <Link href="#">
              <button
                className="rounded-full px-6 py-3 text-xl font-bold text-white transition hover:bg-gray-300"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Get Started with CS Tracer
              </button>
            </Link>
            <Link href="#">
              <button
                className="rounded-full px-6 py-3 text-xl font-bold text-white transition hover:bg-gray-300"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                Request a Demo
              </button>
            </Link>
          </div>
        </section>
      </div>

      {/* About CS Trace Section */}
      <section className="flex-grow content-center py-12 pt-24 text-center">
        <h1 className="mb-6 text-5xl font-bold">What is CS Tracer?</h1>
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-justify text-xl leading-relaxed">
            CS Tracer is a powerful, tier-based traceability platform that
            empowers companies to manage every stage of production with
            unmatched clarity and connectivity. Whether you're managing a single
            tier or overseeing the entire production process, CS Tracer keeps
            your documentation organized, accessible, and securely connected
            across teams and partners.
          </p>
          <p className="mb-8 text-xl leading-relaxed">
            From material extraction to the finished product—CS Tracer supports
            your journey to full traceability.
          </p>

          <div className="flex h-96 w-full items-center justify-center overflow-hidden rounded-3xl">
            <img
              src="/img-1.jpg"
              alt="Image placeholder"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Tier-Based Traceability for Every Level Section */}
      {/* <section className="flex-grow content-center py-12 pt-24 text-center">
        <h1 className="mb-6 text-5xl font-bold">
          Tier-Based Traceability for Every Level{' '}
        </h1>
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-center text-xl leading-relaxed">
            In today’s interconnected supply chains, visibility is key.
          </p>
          <p className="mb-4 text-center text-xl leading-relaxed">
            CS Tracer introduces a new way to manage traceability and connect
            suppliers across every tier of production. Our system{' '}
            <strong>supports</strong> the full hierarchy of textile production,
            helping you track documents and data from:{' '}
            <strong>Tier 4 (Raw Materials)</strong> all the way to{' '}
            <strong>Tier 0 (Retail)</strong>.
          </p>
        </div>

        Aqui van los tiers en esta seccion
        <div className="mx-auto max-w-6xl"></div>
      </section> */}

      {/* Tier-Based Traceability for Every Level Section */}
      <section className="flex-grow content-center py-12 pt-24 text-center">
        <h1 className="mb-6 text-5xl font-bold">
          Tier-Based Traceability for Every Level
        </h1>
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-center text-xl leading-relaxed">
            In today’s interconnected supply chains, visibility is key.
          </p>
          <p className="mb-4 text-center text-xl leading-relaxed">
            CS Tracer introduces a new way to manage traceability and connect
            suppliers across every tier of production. Our system{' '}
            <strong>supports</strong> the full hierarchy of textile production,
            helping you track documents and data from:{' '}
            <strong>Tier 4 (Raw Materials)</strong> all the way to{' '}
            <strong>Tier 0 (Retail)</strong>.
          </p>
        </div>

        {/* Tiers Section */}
        <div className="mx-auto flex max-w-6xl items-center justify-between space-x-4 rounded-lg p-4 first-letter:relative">
          {/* Tier 4 */}
          <div
            className="flex-grow items-center justify-center rounded-full text-white px-6 py-8"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <span className="text-lg font-semibold italic">Tier 4</span>
          </div>

          {/* Tier 3 */}
          <div
            className="flex-grow items-center justify-center rounded-full text-white px-6 py-8"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <span className="text-lg font-semibold italic">Tier 3</span>
          </div>

          {/* Tier 2 */}
          <div
            className="flex-grow items-center justify-center rounded-full text-white px-6 py-8"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <span className="text-lg font-semibold italic">Tier 2</span>
          </div>

          {/* Tier 1 */}
          <div
            className="flex-grow items-center justify-center rounded-full text-white px-6 py-8"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <span className="text-lg font-semibold italic">Tier 1</span>
          </div>

          {/* Tier 0 */}
          <div
            className="flex-grow items-center justify-center rounded-full text-white px-6 py-8"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <span className="text-lg font-semibold italic">Tier 0</span>
          </div>
        </div>
      </section>

      {/* <footer
        className="py-4 text-center text-white"
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        © 2024 CSTracer - All Rights Reserved
      </footer> */}
    </div>
  );
};

export default About;
