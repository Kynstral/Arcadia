export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "University Librarian",
      initials: "SJ",
      quote:
        "Arcadia has transformed how we manage our university library. The cataloging system is intuitive and the analytics help us make better purchasing decisions based on actual usage patterns.",
    },
    {
      name: "David Chen",
      role: "Public Library Director",
      initials: "DC",
      quote:
        "The member management features have saved us countless hours. Our patrons love the self-service options and automated notifications. Implementation was incredibly smooth.",
    },
    {
      name: "Emma Rodriguez",
      role: "Community Library Coordinator",
      initials: "ER",
      quote:
        "As a small community library, we needed something affordable yet powerful. Arcadia exceeded our expectations in every way. The support team has been exceptional throughout.",
    },
  ];

  return (
    <section id="testimonials" className="w-full py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground w-fit">
            Success Stories
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Trusted by <span className="text-primary">Librarians</span> Worldwide
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Hear what library professionals have to say about their experience with Arcadia
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-xl border bg-card p-6 shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/20"
            >
              <div className="mb-4">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-star"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="mb-4 text-base italic leading-relaxed text-muted-foreground">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">{testimonial.initials}</span>
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-6">
            Trusted by libraries across the globe
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <img key={num} src={`/example_${num}.png`} alt="Client logo" className="h-12 w-12" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
