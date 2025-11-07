import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export const PricingSection = () => {
  return (
    <section
      id="pricing"
      className="w-full py-16 md:py-24 lg:py-32 bg-linear-to-br from-muted/50 via-muted/30 to-background"
    >
      <div className="container px-4 md:px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-1/2 h-1/2 bg-primary/3 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-secondary/3 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-primary text-primary-foreground w-fit mx-auto mb-4">
            Beta Access Available Now
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight mb-4">
            Ready to Transform Your Library?
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Join thousands of libraries that trust Arcadia for their management needs. During our
            beta period, get complete access for free.
          </p>

          <div className="mb-10 bg-card border rounded-xl shadow-lg p-8 md:p-10">
            <div className="flex flex-col items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium mb-3">
                Limited Time Beta Offer
              </span>
              <h3 className="text-2xl font-bold mb-2">Free Beta Access</h3>
              <div className="flex items-baseline mb-6">
                <span className="text-5xl font-bold text-primary">$0</span>
                <span className="text-lg text-muted-foreground ml-2">/month</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mb-8">
                {[
                  "Unlimited books",
                  "Unlimited members",
                  "All premium features",
                  "Priority support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <svg
                      className="h-5 w-5 text-primary mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="gap-1.5 px-8 shadow-md font-medium w-full cursor-pointer"
                  >
                    Get Started Free
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="font-medium w-full cursor-pointer">
                    Book a Demo
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required. Access all features during the beta period.
          </p>
        </div>
      </div>
    </section>
  );
};
