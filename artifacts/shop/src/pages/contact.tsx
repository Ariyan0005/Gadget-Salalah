import { AppLayout } from "@/components/layout/AppLayout";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const PHONES = [
  { display: "+968 7214 2828", wa: "96872142828", tel: "+96872142828" },
  { display: "+968 9316 2391", wa: "96893162391", tel: "+96893162391" },
];

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We'll get back to you as soon as possible.",
    });
    (e.target as HTMLFormElement).reset();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-12 lg:py-24 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question about a product, order, or warranty? Our support team in Salalah is ready to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Store */}
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Our Store</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    An Nahdah St, Central Salalah<br/>
                    Salalah, Dhofar<br/>
                    Sultanate of Oman
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Phone */}
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="w-full">
                  <h3 className="font-semibold text-lg mb-3">Phone</h3>
                  <div className="space-y-3">
                    {PHONES.map(({ display, wa, tel }) => (
                      <div key={wa} className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground text-sm font-medium tracking-wide">
                          {display}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/${wa}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="WhatsApp"
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          >
                            <FaWhatsapp className="h-4 w-4" />
                          </a>
                          {/* Call */}
                          <a
                            href={`tel:${tel}`}
                            title="Call"
                            className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <a
                    href="mailto:gadgetsalalah247@gmail.com"
                    className="text-muted-foreground text-sm hover:text-primary transition-colors"
                  >
                    gadgetsalalah247@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Business Hours</h3>
                  <p className="text-muted-foreground text-sm">
                    Friday – Thursday: 9:00 AM – 11:30 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="What is this regarding?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="How can we help you?" rows={6} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto px-8 font-bold">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
