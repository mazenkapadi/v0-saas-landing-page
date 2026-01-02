"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Check, Menu, X, ArrowRight, Star, Zap, Shield, Users, BarChart, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Twitter, Github, Linkedin } from "lucide-react"

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const features = [
    {
      title: "Custom Software Development",
      description: "Tailored software solutions to meet your unique business needs.",
      icon: <Zap className="size-5" />,
    },
    {
      title: "Web Application Development",
      description: "Build dynamic and scalable web applications for your business.",
      icon: <BarChart className="size-5" />,
    },
    {
      title: "E-commerce Solutions",
      description: "Develop robust and user-friendly e-commerce platforms.",
      icon: <Users className="size-5" />,
    },
    {
      title: "Mobile App Development",
      description: "Create native iOS and Android mobile applications.",
      icon: <Shield className="size-5" />,
    },
    {
      title: "Website Design & Development",
      description: "Design and develop visually appealing and functional websites.",
      icon: <Layers className="size-5" />,
    },
    {
      title: "Ongoing Support & Maintenance",
      description: "Reliable support and maintenance services to keep your systems running smoothly.",
      icon: <Star className="size-5" />,
    },
  ]

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"}`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span>ZaytoonTech</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="#services"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Services
            </Link>
            <Link
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
          </nav>
          <div className="hidden md:flex gap-4 items-center"></div>
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
          >
            <div className="container py-4 flex flex-col gap-4">
              <Link href="#services" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
              <Link href="#testimonials" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Testimonials
              </Link>
              <Link href="#pricing" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
              <Link href="#faq" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
            </div>
          </motion.div>
        )}
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Custom Development
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Custom Software & Websites for Your Business
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                We build custom software and websites tailored to your specific business needs. From initial concept to
                final deployment, we're with you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="rounded-full h-12 px-8 text-base">
                  Get Quote
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base bg-transparent">
                  Contact Us
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
                <Image
                  src="https://cdn.dribbble.com/userupload/12302729/file/original-fa372845e394ee85bebe0389b9d86871.png?resize=1504x1128&vertical=center"
                  width={1280}
                  height={720}
                  alt="SaaSify dashboard"
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="w-full py-12 border-y bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Trusted by innovative companies worldwide</p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                    key={i}
                    src={`/placeholder-logo.svg`}
                    alt={`Company logo ${i}`}
                    width={120}
                    height={60}
                    className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="services" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Services
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Services We Offer</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                We provide custom software and website development services to help businesses achieve their goals.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Teams Worldwide</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Don't just take our word for it. See what our customers have to say about their experience.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
              {[
                {
                  quote:
                    "ZaytoonTech developed a custom website for our business, and it has significantly improved our online presence.",
                  author: "Sarah Johnson",
                  role: "Marketing Manager, ABC Corp",
                  rating: 5,
                },
                {
                  quote:
                    "The custom software solution ZaytoonTech built for us has streamlined our operations and saved us a lot of time.",
                  author: "Michael Chen",
                  role: "Operations Director, XYZ Industries",
                  rating: 5,
                },
                {
                  quote:
                    "We are extremely happy with the custom e-commerce platform ZaytoonTech developed for our online store.",
                  author: "Emily Rodriguez",
                  role: "CEO, 123 Enterprises",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex mb-4">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, j) => (
                            <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                          ))}
                      </div>
                      <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Pricing
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Choose the plan that's right for your business. Get started today.
              </p>
            </motion.div>

            <div className="mx-auto max-w-5xl">
              <Tabs defaultValue="monthly" className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="rounded-full p-1">
                    <TabsTrigger value="monthly" className="rounded-full px-6">
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="annually" className="rounded-full px-6">
                      Annually (Save 20%)
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="monthly">
                  <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    {[
                      {
                        name: "Basic Website",
                        price: "$2999",
                        description: "A simple website to establish your online presence.",
                        features: ["Up to 5 pages", "Responsive design", "Basic SEO", "Contact form"],
                        cta: "Get Started",
                      },
                      {
                        name: "E-commerce Website",
                        price: "$7999",
                        description: "A fully functional e-commerce website to sell your products online.",
                        features: [
                          "Unlimited products",
                          "Payment gateway integration",
                          "Inventory management",
                          "Shipping integration",
                          "Customer accounts",
                        ],
                        cta: "Get Started",
                        popular: true,
                      },
                      {
                        name: "Custom Software",
                        price: "$19999",
                        description: "A custom software solution tailored to your specific business needs.",
                        features: [
                          "Custom design and development",
                          "Database integration",
                          "API integration",
                          "Ongoing support and maintenance",
                          "Scalable architecture",
                        ],
                        cta: "Contact Sales",
                      },
                    ].map((plan, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-baseline mt-4">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground ml-1"></span>
                            </div>
                            <p className="text-muted-foreground mt-2">{plan.description}</p>
                            <ul className="space-y-3 my-6 flex-grow">
                              {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-center">
                                  <Check className="mr-2 size-4 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`w-full mt-auto rounded-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                              variant={plan.popular ? "default" : "outline"}
                            >
                              {plan.cta}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="annually">
                  <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    {[
                      {
                        name: "Basic Website",
                        price: "$2399",
                        description: "A simple website to establish your online presence.",
                        features: ["Up to 5 pages", "Responsive design", "Basic SEO", "Contact form"],
                        cta: "Get Started",
                      },
                      {
                        name: "E-commerce Website",
                        price: "$6399",
                        description: "A fully functional e-commerce website to sell your products online.",
                        features: [
                          "Unlimited products",
                          "Payment gateway integration",
                          "Inventory management",
                          "Shipping integration",
                          "Customer accounts",
                        ],
                        cta: "Get Started",
                        popular: true,
                      },
                      {
                        name: "Custom Software",
                        price: "$15999",
                        description: "A custom software solution tailored to your specific business needs.",
                        features: [
                          "Custom design and development",
                          "Database integration",
                          "API integration",
                          "Ongoing support and maintenance",
                          "Scalable architecture",
                        ],
                        cta: "Contact Sales",
                      },
                    ].map((plan, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card
                          className={`relative overflow-hidden h-full ${plan.popular ? "border-primary shadow-lg" : "border-border/40 shadow-md"} bg-gradient-to-b from-background to-muted/10 backdrop-blur`}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                              Most Popular
                            </div>
                          )}
                          <CardContent className="p-6 flex flex-col h-full">
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <div className="flex items-baseline mt-4">
                              <span className="text-4xl font-bold">{plan.price}</span>
                              <span className="text-muted-foreground ml-1"></span>
                            </div>
                            <p className="text-muted-foreground mt-2">{plan.description}</p>
                            <ul className="space-y-3 my-6 flex-grow">
                              {plan.features.map((feature, j) => (
                                <li key={j} className="flex items-center">
                                  <Check className="mr-2 size-4 text-primary" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button
                              className={`w-full mt-auto rounded-full ${plan.popular ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80"}`}
                              variant={plan.popular ? "default" : "outline"}
                            >
                              {plan.cta}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                FAQ
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Find answers to common questions about our platform.
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "What is the typical timeline for a custom software project?",
                    answer:
                      "The timeline varies depending on the complexity of the project. A simple website can take a few weeks, while a complex software application can take several months.",
                  },
                  {
                    question: "How much does custom software development cost?",
                    answer:
                      "The cost depends on the scope and complexity of the project. We offer fixed-price and time-and-materials pricing options.",
                  },
                  {
                    question: "What technologies do you use?",
                    answer:
                      "We use a variety of technologies, including React, Node.js, Python, and more. We choose the best technology stack for each project based on its specific requirements.",
                  },
                  {
                    question: "Do you offer ongoing support and maintenance?",
                    answer:
                      "Yes, we offer ongoing support and maintenance services to keep your software running smoothly.",
                  },
                  {
                    question: "What is your development process?",
                    answer:
                      "We follow an agile development process, which involves close collaboration with our clients throughout the project.",
                  },
                  {
                    question: "How do I get started?",
                    answer:
                      "Contact us to schedule a consultation. We'll discuss your project requirements and provide you with a proposal.",
                  },
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <AccordionItem value={`item-${i}`} className="border-b border-border/40 py-2">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Waitlist/Manifesto Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <Tabs defaultValue="get-started" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="get-started">Get Started</TabsTrigger>
                  <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
                </TabsList>
                <TabsContent value="get-started" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-bold">Request a Consultation</h3>
                          <p className="text-muted-foreground">
                            Discuss your project with our team and get a free quote.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <Button className="w-full">Request Consultation</Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          We'll never spam you. Unsubscribe at any time.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="manifesto" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-bold">Our Manifesto</h3>
                          <p className="text-muted-foreground">We believe technology should empower, not complicate.</p>
                        </div>
                        <div className="space-y-4 text-sm">
                          <p>
                            At ZaytoonTech, we're building more than just software. We're crafting experiences that
                            transform how teams work, collaborate, and achieve their goals.
                          </p>
                          <p>
                            Our mission is simple: to eliminate the friction between great ideas and exceptional
                            execution. We believe that the right tools, designed with intention and care, can unlock
                            human potential in ways we're only beginning to understand.
                          </p>
                          <p>Join us in reimagining what's possible when technology truly serves humanity.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full max-w-[1320px] mx-auto px-5 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0 py-12 md:py-[70px]">
        {/* Left Section: Logo, Description, Social Links */}
        <div className="flex flex-col justify-start items-start gap-8 p-4 md:p-8">
          <div className="flex gap-3 items-stretch justify-center">
            <div className="text-center text-foreground text-xl font-semibold leading-4">Zaytoon Tech</div>
          </div>
          <p className="text-foreground/90 text-sm font-medium leading-[18px] text-left">Coding made effortless</p>
          <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ZaytoonTech. All rights reserved.
            </p>
          <div className="flex justify-start items-start gap-3">
            <a href="#" aria-label="Twitter" className="w-4 h-4 flex items-center justify-center">
              <Twitter className="w-full h-full text-muted-foreground" />
            </a>
            <a href="#" aria-label="GitHub" className="w-4 h-4 flex items-center justify-center">
              <Github className="w-full h-full text-muted-foreground" />
            </a>
            <a href="#" aria-label="LinkedIn" className="w-4 h-4 flex items-center justify-center">
              <Linkedin className="w-full h-full text-muted-foreground" />
            </a>
          </div>
        </div>
        {/* Right Section: Product, Company, Resources */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 p-4 md:p-8 w-full md:w-auto">
          <div className="flex flex-col justify-start items-start gap-3">
            <h3 className="text-muted-foreground text-sm font-medium leading-5">Product</h3>
            <div className="flex flex-col justify-end items-start gap-2">
              <a href="#pricing" className="text-foreground text-sm font-normal leading-5 hover:underline">Pricing</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Integrations</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Real-time Previews</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Multi-Agent Coding</a>
              <a href="/dashboard" className="text-foreground text-sm font-normal leading-5 hover:underline">Admin Portal</a>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-3">
            <h3 className="text-muted-foreground text-sm font-medium leading-5">Company</h3>
            <div className="flex flex-col justify-center items-start gap-2">
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">About us</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Our team</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Careers</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Brand</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Contact</a>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-3">
            <h3 className="text-muted-foreground text-sm font-medium leading-5">Resources</h3>
            <div className="flex flex-col justify-center items-start gap-2">
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Terms of use</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">API Reference</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Documentation</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Community</a>
              <a href="#" className="text-foreground text-sm font-normal leading-5 hover:underline">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
