import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQSection = () => {
  const faqs = [
    {
      question: "How does the free beta access work?",
      answer:
        "During our beta period, you get complete access to all features at no cost. No credit card required. We'll notify you well in advance before any pricing changes, and you'll have the option to continue with a paid plan or export your data.",
    },
    {
      question: "Can I import my existing library data?",
      answer:
        "Yes! Arcadia supports bulk import via CSV files. You can easily migrate your existing book catalog, member information, and borrowing history. Our support team is available to help with the migration process.",
    },
    {
      question: "Is my library data secure?",
      answer:
        "Absolutely. We use industry-standard encryption and security practices. Your data is stored securely with Supabase, featuring row-level security policies, automatic backups, and SSL encryption. We're compliant with data protection regulations.",
    },
    {
      question: "What kind of support do you offer?",
      answer:
        "We provide priority email support for all beta users, comprehensive documentation, video tutorials, and a community forum. For larger institutions, we also offer personalized onboarding and training sessions.",
    },
    {
      question: "Can I use Arcadia for both library and bookstore operations?",
      answer:
        "Yes! Arcadia is designed to handle both library circulation (borrowing/lending) and bookstore operations (sales/inventory). You can use one or both features depending on your needs.",
    },
    {
      question: "Is there a limit on the number of books or members?",
      answer:
        "During the beta period, there are no limits on books, members, or transactions. You can manage collections of any size, from small community libraries to large institutional collections.",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground w-fit">
              FAQ
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Frequently Asked <span className="text-primary">Questions</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Everything you need to know about Arcadia
              </p>
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index + 1}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button variant="outline" size="lg">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
