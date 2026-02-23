import { Phone, ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6 max-w-3xl mx-auto">
          Ready to Build? Let's Talk About <span className="text-gradient-gold">Your Project</span>
        </h2>
        <p className="text-primary-foreground/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Whether it's a new addition, a kitchen remodel, or a complete build — On Time Construction is Albuquerque's trusted partner for quality construction. Get your free estimate today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:5059801923"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-heading font-bold px-10 py-5 rounded-md hover:brightness-110 transition-all shadow-cta text-lg"
          >
            <Phone className="w-5 h-5" />
            Call (505) 980-1923
          </a>
          <a
            href="/#contact-form"
            className="inline-flex items-center justify-center gap-2 border-2 border-primary-foreground/30 text-primary-foreground font-heading font-semibold px-10 py-5 rounded-md hover:border-secondary hover:text-secondary transition-all text-lg"
          >
            Request a Consultation
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        <p className="text-primary-foreground/40 text-sm mt-8">
          Serving Albuquerque, Rio Rancho, Corrales, Bernalillo, and surrounding areas.
        </p>
      </div>
    </section>
  );
};

export default FinalCTA;
