import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-beauty.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Professional makeup artistry"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-foreground/40" />
      </div>
      <div className="relative container px-6 pt-16">
        <div className="max-w-xl animate-fade-in">
          <p className="section-subheading text-cream/80 mb-4">{t("heroSubheading")}</p>
          <h1 className="font-display text-5xl md:text-7xl font-medium text-cream leading-tight mb-6">
            {t("heroTitle1")}<br />{t("heroTitle2")}
          </h1>
          <p className="font-body text-cream/70 text-lg mb-10 max-w-md leading-relaxed">
            {t("heroDescription")}
          </p>
          <Link to="/booking" className="btn-hero inline-block rounded">
            {t("heroButton")}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
