import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Booking = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const formSchema = z.object({
    service: z.string().min(1, t("fillAllFields")),
    date: z.date({
      required_error: t("fillAllFields"),
    }),
    time: z.string().min(1, t("fillAllFields")),
    name: z.string().min(2, t("fillAllFields")),
    email: z.string().email(t("fillAllFields")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service: "",
      time: "",
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setSubmittedName(values.name);
    setIsSubmitted(true);
    toast.success(t("bookingSuccess"));
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-32 pb-16 flex items-center justify-center">
          <div className="container px-6 max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary animate-in zoom-in duration-500" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-semibold mb-4">{t("bookingConfirmed")}</h1>
            <p className="text-muted-foreground font-body mb-8 leading-relaxed">
              {t("bookingThankYou")
                .replace("{name}", submittedName)
                .replace("{service}", t(form.getValues("service") as any))
                .replace("{date}", format(form.getValues("date"), "PPP"))
                .replace("{time}", form.getValues("time"))}
            </p>
            <Button 
              className="w-full" 
              onClick={() => {
                setIsSubmitted(false);
                form.reset();
              }}
            >
              {t("bookNow")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-16">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side: Information */}
            <div className="space-y-6">
              <div>
                <p className="section-subheading mb-3">{t("bookingSubheading")}</p>
                <h1 className="section-heading text-left">{t("bookingHeading")}</h1>
                <p className="text-muted-foreground font-body mt-4 leading-relaxed">
                  Ready to elevate your look? Reserve your session with our master artists. 
                  Whether it's for your wedding, a special event, or a creative project, 
                  we ensure a premium experience tailored to your unique beauty.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-display font-medium text-foreground">{t("bridalTitle")}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t("bridalDesc")}</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg bg-secondary/50 border border-border">
                  <Sparkles className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <h3 className="font-display font-medium text-foreground">{t("glamTitle")}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{t("glamDesc")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div className="bg-background rounded-2xl p-8 border border-border shadow-xl shadow-primary/5">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" /> {t("selectService")}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-secondary/30">
                              <SelectValue placeholder={t("selectService")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bridal">{t("bridal")}</SelectItem>
                            <SelectItem value="glam">{t("glam")}</SelectItem>
                            <SelectItem value="editorial">{t("editorial")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" /> {t("pickDate")}
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal bg-secondary/30",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{t("chooseDate")}</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> {t("selectTime")}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-secondary/30">
                                <SelectValue placeholder={t("selectTime")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" /> {t("name")}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t("yourName")} {...field} className="bg-secondary/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" /> {t("email")}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} className="bg-secondary/30" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full btn-hero py-6 h-auto text-lg rounded-xl">
                    {t("confirmBooking")}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
