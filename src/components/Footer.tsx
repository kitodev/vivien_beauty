import { useLanguage } from "@/i18n/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container px-6 text-center">
        <p className="font-display text-2xl font-semibold text-foreground mb-2">Vievien Beauty</p>
        <p className="text-muted-foreground text-sm font-body">
          © {new Date().getFullYear()} Vivien Beauty. {t("allRightsReserved")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
