import { useEffect, useState } from 'react';
import Navbar from '../components/landing-page-navbar';
import '../app/globals.css';
import Link from 'next/link';

type Feature = {
  title: string;
  description: string;
  image: string;
};

const features: Feature[] = [
  {
    title: 'Inventory Management',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi diam, posuere non congue non, ultrices nec mi. Nulla facilisi. Curabitur pellentesque gravida congue. Quisque accumsan venenatis lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex. Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.',
    image: '/img-1.jpg',
  },
  {
    title: 'Purchase Management',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi diam, posuere non congue non, ultrices nec mi. Nulla facilisi. Curabitur pellentesque gravida congue. Quisque accumsan venenatis lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex. Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.',
    image: '/landing-background.jpg',
  },
  {
    title: 'Sales Order Management',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi diam, posuere non congue non, ultrices nec mi. Nulla facilisi. Curabitur pellentesque gravida congue. Quisque accumsan venenatis lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex. Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.',
    image: '/img-1.jpg',
  },
  {
    title: 'Planning and Forecasting',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi diam, posuere non congue non, ultrices nec mi. Nulla facilisi. Curabitur pellentesque gravida congue. Quisque accumsan venenatis lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex. Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.',
    image: '/landing-background.jpg',
  },
  {
    title: 'Production Management',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi diam, posuere non congue non, ultrices nec mi. Nulla facilisi. Curabitur pellentesque gravida congue. Quisque accumsan venenatis lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex. Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.',
    image: '/img-1.jpg',
  },
  {
    title: 'Cloud Accounting',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi diam, posuere non congue non, ultrices nec mi. Nulla facilisi. Curabitur pellentesque gravida congue. Quisque accumsan venenatis lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex. Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.',
    image: '/landing-background.jpg',
  },
];

const About = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    setStartAnimation(true);

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      <section
        id="about"
        className="flex-grow content-center py-12 pt-24 text-center"
      >
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
      <section
        id="tier-system"
        className="flex-grow content-center py-12 pt-24 text-center"
      >
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
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between space-x-4 rounded-lg p-4 pt-8">
          {/* Tier 4 */}
          <div
            className="relative items-center rounded-full px-20 py-8"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <span className="font-semibold italic text-white">Tier 4</span>

            <div
              className="absolute right-[-32px] top-1/2 z-30 -translate-y-1/2 transform rounded-full p-1 text-white"
              style={{ backgroundColor: '#D51E3E' }}
            >
              {' '}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Tier 3 */}
          <div
            className="relative items-center rounded-full px-20 py-8"
            style={{ backgroundColor: 'var(--primary-color)', marginLeft: '0' }}
          >
            <span className="font-semibold italic text-white">Tier 3</span>

            <div
              className="absolute right-[-32px] top-1/2 z-30 -translate-y-1/2 transform rounded-full p-1 text-white"
              style={{ backgroundColor: '#D51E3E' }}
            >
              {' '}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Tier 2 */}
          <div
            className="relative items-center rounded-full px-20 py-8"
            style={{ backgroundColor: 'var(--primary-color)', marginLeft: '0' }}
          >
            <span className="font-semibold italic text-white">Tier 2</span>

            <div
              className="absolute right-[-32px] top-1/2 z-30 -translate-y-1/2 transform rounded-full p-1 text-white"
              style={{ backgroundColor: '#D51E3E' }}
            >
              {' '}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Tier 1 */}
          <div
            className="relative items-center rounded-full px-20 py-8"
            style={{ backgroundColor: 'var(--primary-color)', marginLeft: '0' }}
          >
            <span className="font-semibold italic text-white">Tier 1</span>

            <div
              className="absolute right-[-32px] top-1/2 z-30 -translate-y-1/2 transform rounded-full p-1 text-white"
              style={{ backgroundColor: '#D51E3E' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-10 w-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>

          {/* Tier 0 */}
          <div
            className="relative items-center rounded-full px-20 py-8"
            style={{ backgroundColor: 'var(--primary-color)', marginLeft: '0' }}
          >
            <span className="font-semibold italic text-white">Tier 0</span>
          </div>
        </div>

        {/* Image and Text */}
        <div className="mx-auto flex max-w-6xl space-x-10 pt-8">
          {/* Imagen */}
          <div className="flex h-96 w-1/2 items-center justify-center overflow-hidden rounded-3xl">
            <img
              src="/img-1.jpg"
              alt="Image placeholder"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>

          {/* Texto */}
          <div className="h-100% w-1/2 flex-row">
            <p className="text-left text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
              nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam
              erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci
              tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo
              consequat. Duis autem
            </p>
            <ul className="list-none pl-5 pt-5 text-left text-lg leading-relaxed">
              <li className="mb-2">- Lorem ipsum dolor sit amet</li>
              <li className="mb-2">- Lorem ipsum dolor sit amet</li>
              <li className="mb-2">- Lorem ipsum dolor sit amet</li>
            </ul>
            <p className="pt-5 text-left text-lg leading-relaxed">
              Lorem ipsum dolor sit amet, consectetuer
            </p>
          </div>
        </div>
        {/* Divs */}
        <div className="mx-auto flex max-w-6xl space-x-5 pt-8">
          <div
            className="flex w-1/3 flex-col items-center justify-center rounded-3xl p-14"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <h3 className="mb-6 font-bold text-white">Live Document Sharing</h3>
            <p className="text-center text-white">
              Request, view, and share documents instantly across tiers.
            </p>
          </div>

          <div
            className="flex w-1/3 flex-col items-center justify-center rounded-3xl p-14"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <h3 className="mb-6 font-bold text-white">
              Real-Time Transparency
            </h3>
            <p className="text-center text-white">
              Monitor document completion, pending items, and progress updates
              from partners.
            </p>
          </div>

          <div
            className="flex w-1/3 flex-col items-center justify-center rounded-3xl p-14"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <h3 className="mb-6 font-bold text-white">
              Connectivity Across Processes
            </h3>
            <p className="text-center text-white">
              Seamlessly collaborate with partners, gaining visibility into
              every tier’s document status and history.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="tier-system"
        className="flex-grow content-center py-12 pt-24 text-center"
      >
        <h1 className="mb-6 text-5xl font-bold">Lorem Ipsum</h1>
        <div className="mx-auto max-w-6xl pt-3">
          <p className="mb-4 text-center text-sm leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nisi
            diam, posuere non congue non, ultrices nec mi. Nulla facilisi.
            Curabitur pellentesque gravida congue. Quisque accumsan venenatis
            lacus et luctus. Cras vitae augue arcu. Proin pharetra turpis ex.
            Mauris tellus lacus, dictum vitae mi sed, pretium dictum augue.
            Aliquam dictum ipsum mauris, non interdum sapien facilisis nec.
            Morbi et risus vitae turpis porta malesuada nec a nunc. Duis
            condimentum mattis fermentum. Sed in molestie lacus, a ultricies
            sem. Integer commodo non lorem eu aliquet. Mauris nec ultricies
            eros, nec cursus nunc.
          </p>
        </div>

        <div
          className="mx-auto mt-10 max-w-6xl justify-center rounded-3xl p-12"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          <div className="flex space-x-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative overflow-hidden rounded-lg p-4 text-white ${
                  activeIndex === index ? 'bg-red-400' : ''
                }`}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-purple-500"
                  style={{
                    backgroundColor: '#D51E3E',
                    transition:
                      startAnimation && activeIndex === index
                        ? 'width 5s linear'
                        : 'none',
                    width: activeIndex === index ? '100%' : '0',
                  }}
                ></div>

                  {/* Icon svg */}


                <h3 className="relative z-10 text-sm text-left font-semibold">
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>

          {/* Image and Text */}
          <div className="mx-auto flex max-w-6xl space-x-10 pt-8">
            {/* Image */}
            <div className="flex h-96 w-1/2 items-center justify-center overflow-hidden rounded-2xl">
              <img
                src={features[activeIndex].image}
                alt={features[activeIndex].title}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>

            {/* Text */}
            <div className="flex h-full w-1/2 flex-col text-left">
              <h2 className="text-3xl font-semibold text-white">
                {features[activeIndex].title}
              </h2>
              <p className="text-md mt-10 leading-relaxed text-white">
                {features[activeIndex].description}
              </p>
            </div>
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
