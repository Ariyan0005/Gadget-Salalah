import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AlertCircle, Clock3, PackageCheck, ShieldCheck } from "lucide-react";

const REQUIREMENTS = [
  "The return request must be made within 7 days of delivery.",
  "Products must be completely unopened, unused, and in their original sealed packaging.",
  "All original accessories, manuals, boxes, seals, and included items must be present.",
  "Please keep your order confirmation or receipt available when contacting us.",
];

export default function ReturnPolicy() {
  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-4 py-12 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <PackageCheck className="h-7 w-7" />
          </div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-accent">Customer Care</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Return Policy</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            We accept returns within one week of delivery for eligible products that are still unopened and in
            their original condition.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <Clock3 className="h-6 w-6 text-accent" />
              <h2 className="font-bold">7-day window</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Contact us within 7 days from the date your order is delivered.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <ShieldCheck className="h-6 w-6 text-accent" />
              <h2 className="font-bold">Unopened only</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Products must remain sealed, unused, and in fresh original condition.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <PackageCheck className="h-6 w-6 text-accent" />
              <h2 className="font-bold">Complete packaging</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Keep the box, seals, accessories, manuals, and all included items together.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Return requirements</h2>
              <ul className="mt-5 space-y-4">
                {REQUIREMENTS.map((requirement) => (
                  <li key={requirement} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20">
            <CardContent className="flex items-start gap-4 p-6 sm:p-8">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h2 className="text-lg font-bold text-amber-950 dark:text-amber-200">Opened products are not eligible</h2>
                <p className="mt-2 leading-relaxed text-amber-900/80 dark:text-amber-100/80">
                  Once a product has been opened, activated, used, or its original seal has been broken, it cannot
                  be returned under this policy.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-xl font-bold">Need to request a return?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Contact our support team with your order number and a brief reason for the return before sending
              anything back.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}