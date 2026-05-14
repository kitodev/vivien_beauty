import { Sparkles, Heart, Crown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ServicesSection = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Heart,
      title: t("bridalTitle"),
      description: t("bridalDesc"),
      price: "$350",
    },
    {
      icon: Sparkles,
      title: t("glamTitle"),
      description: t("glamDesc"),
      price: "$180",
    },
    {
      icon: Crown,
      title: t("editorialTitle"),
      description: t("editorialDesc"),
      price: "$250",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center mb-16">
          <p className="section-subheading mb-3">{t("servicesSubheading")}</p>
          <h2 className="section-heading text-foreground">{t("servicesHeading")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service) => (
            <div
              key={service.title}
              className="group bg-card border border-border rounded-lg p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-medium text-foreground mb-3">
                {service.title}
              </h3>
              <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <p className="font-display text-3xl font-semibold text-primary">
                {service.price}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
