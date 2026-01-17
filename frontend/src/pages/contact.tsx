import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { ContactForm } from "@/components/public/contact-form";
import { FadeIn } from "@/components/ui/scroll-animations";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <FadeIn direction="down" delay={0.1}>
                <p className="text-sm font-medium text-accent mb-4 uppercase tracking-wider">Contact Us</p>
              </FadeIn>
              <FadeIn direction="up" delay={0.2}>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
                  Let's Start a Conversation
                </h1>
              </FadeIn>
              <FadeIn direction="up" delay={0.3}>
                <p className="text-lg text-muted-foreground">
                  Whether you're looking for capital solutions or investment opportunities, 
                  our team is ready to help you achieve your financial goals.
                </p>
              </FadeIn>
            </div>

            <FadeIn direction="up" delay={0.4}>
              <ContactForm />
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
