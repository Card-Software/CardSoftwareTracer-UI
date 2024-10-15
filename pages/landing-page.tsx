// pages/about.tsx
import Navbar from '../components/landing-page-navbar';
import '../app/globals.css';

const About = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="flex-grow bg-gray-100 py-12 text-center">
        <h2 className="mb-6 text-3xl font-bold">About CSTracer</h2>
        <p className="mx-auto mb-4 max-w-3xl text-lg text-gray-700">
          CSTracer is a comprehensive software solution designed to streamline
          the tracking of orders between textile and clothing companies. Our
          platform enables efficient management of material orders,
          communication, and real-time updates, providing transparency and
          improved collaboration across the supply chain.
        </p>
        <p className="mx-auto max-w-3xl text-lg text-gray-700">
          Our mission is to help companies enhance productivity, reduce delays,
          and simplify operations by offering a user-friendly interface,
          powerful data analytics, and seamless integration with ERP systems.
        </p>
      </section>
      <footer
        className=" py-4 text-center text-white"
        style={{ backgroundColor: 'var(--primary-color)' }}
      >
        © 2024 CSTracer - All Rights Reserved
      </footer>
    </div>
  );
};

export default About;
