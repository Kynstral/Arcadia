import { useCounter } from "@/hooks/use-counter";

export const StatsSection = () => {
  const libraries = useCounter(2300, 2000);
  const books = useCounter(50000, 2500);
  const members = useCounter(125000, 2500);

  return (
    <section className="w-full py-12 md:py-16 bg-background border-y">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {libraries.toLocaleString()}+
            </div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">
              Libraries Worldwide
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {books.toLocaleString()}+
            </div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">
              Books Managed
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
              {members.toLocaleString()}+
            </div>
            <div className="text-sm md:text-base text-muted-foreground font-medium">
              Active Members
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
