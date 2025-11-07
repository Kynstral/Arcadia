import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Info } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-36 bg-linear-to-br from-background via-background to-primary/10">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2 items-center">
          <div className="flex flex-col justify-center space-y-5">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 w-fit">
              Library Management Simplified
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Modern Library <span className="text-primary">Management</span> Solution
              </h1>
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl leading-relaxed">
                Streamline your library operations with our comprehensive management system. From
                efficient cataloging to member management and insightful analytics — all in one
                intuitive platform.
              </p>
            </div>
            <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2">
              <Link to="/auth">
                <Button size="lg" className="gap-1.5 shadow-md font-medium px-6 cursor-pointer">
                  Get Started Free
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="gap-1.5 font-medium cursor-pointer">
                  Learn More
                  <Info className="h-4 w-4 ml-1" />
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-5 w-5 text-primary"
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
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-5 w-5 text-primary"
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
                <span>Free 14-day trial</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full overflow-hidden rounded-xl shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2300&auto=format&fit=crop"
                alt="Modern library interior with bookshelves and reading areas"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last transition-transform duration-700 hover:scale-105"
                width={600}
                height={360}
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/30 to-transparent"></div>
              <div className="absolute bottom-4 left-4 rounded-lg bg-background/90 backdrop-blur-sm p-3 shadow-lg border border-primary/10">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Used by 2,300+ libraries worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
