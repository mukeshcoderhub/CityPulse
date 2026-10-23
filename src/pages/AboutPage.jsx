
import { Link } from "react-router-dom";
import { MapPin, Users, Eye, ArrowRight } from "lucide-react";

const AboutPage = () => {
  return (
    <main className="min-h-screen w-full bg-slate-50 px-5 py-10 text-slate-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12">
          <span className="text-sm font-semibold uppercase tracking-widest text-rose-500">
            About CityPulse
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Your City, Your Voice.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            CityPulse is a community-driven platform that helps people
            report, discover, and track problems in their cities.
            We believe that making problems visible is the first step
            toward building better communities.
          </p>
        </div>

        {/* Mission */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-bold">Our Mission</h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            From damaged roads and overflowing garbage to broken
            streetlights and water leakage, everyday city problems
            affect everyone. CityPulse brings these issues together
            in one place so citizens can share information and stay
            aware of what's happening around them.
          </p>
        </section>

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">How CityPulse Works</h2>

          <p className="mt-2 text-slate-600">
            A simple way to make local problems visible.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <MapPin size={22} />
              </div>

              <h3 className="font-semibold">Report Problems</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Submit a city issue with its location, description,
                and a photograph.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <Users size={22} />
              </div>

              <h3 className="font-semibold">Community Participation</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Explore reports and contribute signals to help the
                community understand local issues.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <Eye size={22} />
              </div>

              <h3 className="font-semibold">Track Issues</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                View reported problems on the feed and map, and
                follow their status over time.
              </p>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="mt-12 rounded-2xl bg-slate-900 p-7 text-white sm:p-9">
          <h2 className="text-2xl font-bold">Our Vision</h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            We want to create a future where citizens are more aware
            of local problems, communities work together, and every
            person has an easier way to make their concerns visible.
          </p>

          <Link
            to="/report"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Report an Issue
            <ArrowRight size={17} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          Made for communities. Built for better cities.
          <p className="mt-1">© {new Date().getFullYear()} CityPulse</p>
        </footer>
      </div>
    </main>
  );
};

export default AboutPage;
