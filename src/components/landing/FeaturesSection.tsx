import { BarChart, BookMarked, Clock, Search, Users } from "lucide-react";

export const FeaturesSection = () => {
  return (
    <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground w-fit">
            Powerful Features
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything You Need to <span className="text-primary">Transform</span> Your Library
            </h2>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              Our platform provides a comprehensive set of tools to streamline library operations
              and enhance the experience for both staff and patrons.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="group flex flex-row items-start gap-4 h-full rounded-xl border p-6 shadow-xs bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:translate-y-[-4px]">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <BookMarked className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                Smart Cataloging
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Easily manage your collection with powerful cataloging features including bulk
                imports, custom fields, and automatic metadata retrieval.
              </p>
            </div>
          </div>

          <div className="group flex flex-row items-start gap-4 h-full rounded-xl border p-6 shadow-xs bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:translate-y-[-4px]">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                Member Management
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Keep track of members, manage subscriptions, and customize access privileges with an
                intuitive and powerful management system.
              </p>
            </div>
          </div>

          <div className="group flex flex-row items-start gap-4 h-full rounded-xl border p-6 shadow-xs bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:translate-y-[-4px]">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                Advanced Search
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Powerful search capabilities with filters and suggestions make finding any item in
                your collection fast and intuitive for both staff and patrons.
              </p>
            </div>
          </div>

          <div className="group flex flex-row items-start gap-4 h-full rounded-xl border p-6 shadow-xs bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:translate-y-[-4px]">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                Real-time Analytics
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get actionable insights into library usage, popular items, and member activity with
                detailed customizable reports and dashboards.
              </p>
            </div>
          </div>

          <div className="group flex flex-row items-start gap-4 h-full rounded-xl border p-6 shadow-xs bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:translate-y-[-4px]">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                Checkout System
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Streamline the checkout process with automated due date calculations, self-checkout
                options, and flexible renewal settings.
              </p>
            </div>
          </div>

          <div className="group flex flex-row items-start gap-4 h-full rounded-xl border p-6 shadow-xs bg-card hover:shadow-md transition-all duration-300 hover:border-primary/30 hover:translate-y-[-4px]">
            <div className="rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                Notifications & Reminders
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatically send due date reminders, overdue notices, and availability
                notifications through email, SMS, or in-app messages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
