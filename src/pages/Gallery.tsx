import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

import before1 from "@/assets/gallery/before-1.jpg";
import after1 from "@/assets/gallery/after-1.jpg";
import before2 from "@/assets/gallery/before-2.jpg";
import after2 from "@/assets/gallery/after-2.jpg";
import before3 from "@/assets/gallery/before-3.jpg";
import after3 from "@/assets/gallery/after-3.jpg";
import type { TranslationKey } from "@/i18n/translations";

interface Transformation {
  id: string | number;
  before: string;
  after: string;
  title: string;
  description: string;
  category: string;
}

const BeforeAfterCard = ({
  before,
  after,
  title,
  description,
  beforeLabel,
  afterLabel,
}: {
  before: string;
  after: string;
  title: string;
  description: string;
  beforeLabel: string;
  afterLabel: string;
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div className="group">
      <div
        className="relative aspect-[4/5] rounded-lg overflow-hidden cursor-col-resize select-none border border-border"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        <img
          src={after}
          alt={`${title} - after`}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={640}
          height={800}
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={before}
            alt={`${title} - before`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ minWidth: `${(100 / sliderPos) * 100}%`, maxWidth: "none", width: "auto" }}
            loading="lazy"
            width={640}
            height={800}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary-foreground/80 z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary-foreground/90 border-2 border-primary flex items-center justify-center shadow-lg">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary">
              <path d="M5 3L2 8L5 13M11 3L14 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <span className="absolute top-3 left-3 bg-foreground/60 text-primary-foreground text-[10px] font-body tracking-widest uppercase px-2 py-1 rounded z-10">
          {beforeLabel}
        </span>
        <span className="absolute top-3 right-3 bg-primary/80 text-primary-foreground text-[10px] font-body tracking-widest uppercase px-2 py-1 rounded z-10">
          {afterLabel}
        </span>
      </div>
      <div className="mt-4">
        <h3 className="font-display text-xl font-medium text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm font-body mt-1">{description}</p>
      </div>
    </div>
  );
};

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [dynamicTransformations, setDynamicTransformations] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_images")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          // Group by pair_id or fallback to title if pair_id is null
          const pairs: { [key: string]: Partial<Transformation> } = {};

          data.forEach((img) => {
            const key = img.pair_id || img.title;
            if (!pairs[key]) {
              pairs[key] = {
                id: key,
                title: img.title,
                category: img.category,
                description: "", // Description could be added to DB if needed
              };
            }
            if (img.image_type === "before") {
              pairs[key].before = img.image_url;
            } else {
              pairs[key].after = img.image_url;
            }
          });

          const processed = Object.values(pairs)
            .filter((p) => p.before && p.after) // Only show complete pairs for now
            .map((p) => p as Transformation);

          setDynamicTransformations(processed);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const staticTransformations: any[] = [
    {
      id: "s1",
      before: before1,
      after: after1,
      titleKey: "eveningGlam",
      descKey: "eveningGlamDesc",
      category: "glam",
    },
    {
      id: "s2",
      before: before2,
      after: after2,
      titleKey: "bridalRadiance",
      descKey: "bridalRadianceDesc",
      category: "bridal",
    },
    {
      id: "s3",
      before: before3,
      after: after3,
      titleKey: "editorialBold",
      descKey: "editorialBoldDesc",
      category: "editorial",
    },
  ];

  const allTransformations: Transformation[] = [
    ...dynamicTransformations,
    ...staticTransformations.map(st => ({
      id: st.id,
      before: st.before,
      after: st.after,
      title: t(st.titleKey as TranslationKey),
      description: t(st.descKey as TranslationKey),
      category: st.category
    }))
  ];

  const categories = [
    { id: "all", labelKey: "all" as TranslationKey },
    { id: "bridal", labelKey: "bridal" as TranslationKey },
    { id: "glam", labelKey: "glam" as TranslationKey },
    { id: "editorial", labelKey: "editorial" as TranslationKey },
  ];

  const filtered =
    activeCategory === "all"
      ? allTransformations
      : allTransformations.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container px-6">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          <div className="text-center mb-12">
            <p className="section-subheading mb-3">{t("gallerySubheading")}</p>
            <h1 className="section-heading text-foreground">{t("galleryHeading")}</h1>
            <p className="text-muted-foreground font-body mt-4 max-w-md mx-auto">
              {t("galleryDescription")}
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-5 py-2 rounded-full font-body text-xs tracking-widest uppercase transition-all duration-200",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {filtered.map((item) => (
              <BeforeAfterCard
                key={item.id}
                before={item.before}
                after={item.after}
                title={item.title}
                description={item.description}
                beforeLabel={t("before")}
                afterLabel={t("after")}
              />
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-muted-foreground font-body mb-4">{t("galleryCta")}</p>
            <Link to="/booking" className="btn-hero inline-block rounded">
              {t("heroButton")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;
