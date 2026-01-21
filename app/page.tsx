import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  Sparkles,
  DollarSign,
  Link as LinkIcon,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            First Look
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered damage assessment for contractors. Let your customers
            upload photos, get instant estimates, and close more jobs.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/signup">
              <Button size="lg">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <LinkIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Create Upload Link</CardTitle>
                <CardDescription>
                  Generate a personalized upload link for each customer or job
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>2. Customer Uploads</CardTitle>
                <CardDescription>
                  Your customer takes photos or video of the repair needed and
                  submits through your link
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>3. AI Analysis</CardTitle>
                <CardDescription>
                  Our AI analyzes the damage and provides you with a detailed
                  assessment and cost estimate
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Contractors
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex gap-4 p-6 rounded-lg border bg-card">
              <DollarSign className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Instant Cost Estimates</h3>
                <p className="text-muted-foreground">
                  Get AI-generated cost ranges based on damage severity,
                  materials, and labor - before you even visit the site.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border bg-card">
              <Sparkles className="w-8 h-8 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Damage Assessment</h3>
                <p className="text-muted-foreground">
                  AI identifies damage type, severity score, and provides a
                  detailed summary - helping you prioritize jobs.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border bg-card">
              <LinkIcon className="w-8 h-8 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Personalized Links</h3>
                <p className="text-muted-foreground">
                  Create branded upload links for each customer. They see your
                  business name, you get organized submissions.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-lg border bg-card">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-2">Project Dashboard</h3>
                <p className="text-muted-foreground">
                  All customer uploads in one place. Track status from initial
                  upload to job completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to streamline your estimates?</h2>
          <p className="text-lg opacity-90">
            Join contractors who are using AI to quote jobs faster and more
            accurately.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-5xl mx-auto text-center text-sm text-muted-foreground">
          <p>First Look - AI-Powered Damage Assessment for Contractors</p>
        </div>
      </footer>
    </main>
  );
}
