import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, CheckCircle, Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  investmentRange: z.string().optional(),
  message: z.string().min(10, "Please provide more details"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const investmentRanges = [
  { value: "under-1cr", label: "Under ₹1 Crore" },
  { value: "1-5cr", label: "₹1 - 5 Crores" },
  { value: "5-25cr", label: "₹5 - 25 Crores" },
  { value: "25-100cr", label: "₹25 - 100 Crores" },
  { value: "above-100cr", label: "Above ₹100 Crores" },
];

// EmailJS configuration - send directly to company email
const EMAILJS_CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || "",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "",
  toEmail: import.meta.env.VITE_CONTACT_EMAIL || "",
};

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      investmentRange: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);

    try {
      // Send email using EmailJS
      const templateParams = {
        to_email: EMAILJS_CONFIG.toEmail,
        from_name: data.name,
        from_email: data.email,
        phone: data.phone || "Not provided",
        company: data.company || "Not provided",
        investment_range: data.investmentRange || "Not specified",
        message: data.message,
        reply_to: data.email,
      };

      // If EmailJS is configured, send the email
      if (EMAILJS_CONFIG.publicKey) {
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams,
          EMAILJS_CONFIG.publicKey
        );
      } else {
        // Fallback: Log to console and save to backend
        console.log("EmailJS not configured. Contact form data:", templateParams);
      }

      // Also save to backend for record keeping
      try {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (backendError) {
        console.log("Backend save optional:", backendError);
      }

      setSubmitted(true);
      toast({
        title: "Message Sent",
        description: "Thank you for your interest. Our team will reach out shortly.",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-card">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Thank You!</h3>
          <p className="text-muted-foreground mb-6">
            Your message has been received. Our team will contact you within 24 hours.
          </p>
          <Button onClick={() => setSubmitted(false)} variant="outline" data-testid="button-send-another">
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground">
            Ready to explore how Godman Capital can help you achieve your financial goals?
            Reach out to our team for a confidential discussion.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Email</p>
              <a href="mailto:info@godmancapital.in" className="text-muted-foreground hover:text-foreground transition-colors">
                info@godmancapital.in
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Phone</p>
              <a href="tel:+919876543210" className="text-muted-foreground hover:text-foreground transition-colors">
                +91 98765 43210
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Office</p>
              <p className="text-muted-foreground">
                Mumbai, Maharashtra<br />India
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium">Business Hours</p>
              <p className="text-muted-foreground">
                Mon - Fri: 9:00 AM - 6:00 PM IST
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="lg:col-span-3 bg-card">
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...form.register("name")}
                  data-testid="input-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...form.register("email")}
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...form.register("phone")}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Your company"
                  {...form.register("company")}
                  data-testid="input-company"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentRange">Investment Range</Label>
              <Select
                onValueChange={(value) => form.setValue("investmentRange", value)}
              >
                <SelectTrigger data-testid="select-investment-range">
                  <SelectValue placeholder="Select investment range" />
                </SelectTrigger>
                <SelectContent>
                  {investmentRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                placeholder="Tell us about your requirements..."
                rows={4}
                {...form.register("message")}
                data-testid="input-message"
              />
              {form.formState.errors.message && (
                <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit-contact"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By submitting this form, you agree to our privacy policy and consent to receive communications from Godman Capital.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
