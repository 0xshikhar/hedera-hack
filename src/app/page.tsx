"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle, Database, ExternalLink, FileText, Layers, LockKeyhole, Shield, Store, Server, Globe, Zap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Home() {
  const isMobile = useIsMobile();
  return (
      <div className="flex flex-col">
        {/* Announcement Banner */}
        <div className="w-full pt-6 text-center">
          <div className="container mx-auto flex items-center justify-center px-4">
            <div className="inline-flex items-center rounded-full bg-primary/20 p-1 text-primary shadow-sm">
              <Link href="#features" className="flex items-center gap-2 px-3 py-1">
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">
                  New
                </span>
                <span className="text-sm font-medium">
                  Decentralized Storage Providers on Hedera 🚀
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-[85vh] w-full flex items-center bg-gradient-to-br from-background to-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    DePIN for AI Data Economy
                  </h1>
                  <p className="max-w-[600px] text-xl text-muted-foreground">
                    The worlds first Decentralized Physical Infrastructure Network purpose-built for the $200B+ AI data market. Create, verify, and trade synthetic datasets with real infrastructure providers on Hedera.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="bg-primary text-white" asChild>
                    <Link href="/marketplace" className="flex items-center text-white dark:text-black">
                      Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/providers" className="flex items-center">
                      View Providers <Server className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-full max-w-[500px] h-[500px] flex items-center justify-center">
                  {/* Central icon */}
                  <div className="absolute z-30 w-36 h-36 rounded-full bg-primary/80 flex items-center justify-center border-2 border-primary shadow-lg shadow-primary/20">
                    <Database className="h-16 w-16 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Rotating circle */}
                  <div className="absolute w-96 h-96 rounded-full border-4 border-dashed border-primary/40 animate-[spin_20s_linear_infinite]"></div>

                  {/* Orbiting elements */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-16 h-16 rounded-lg bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-md"
                      style={{
                        transform: `rotate(${i * 45}deg) translateX(180px) rotate(-${i * 45}deg)`,
                        animation: `pulse 3s infinite ease-in-out ${i * 0.2}s`,
                      }}
                    >
                      {i % 4 === 0 && <Database className="h-8 w-8 text-primary" />}
                      {i % 4 === 1 && <LockKeyhole className="h-8 w-8 text-primary" />}
                      {i % 4 === 2 && <BarChart3 className="h-8 w-8 text-primary" />}
                      {i % 4 === 3 && <Shield className="h-8 w-8 text-primary" />}
                    </div>
                  ))}

                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 500">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 8 }).map((_, i) => {
                      const angle = i * 45 * (Math.PI / 180)
                      const x = 250 + 180 * Math.cos(angle)
                      const y = 250 + 180 * Math.sin(angle)
                      return (
                        <line
                          key={i}
                          x1="250"
                          y1="250"
                          x2={x}
                          y2={y}
                          stroke="url(#lineGradient)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="animate-pulse"
                        />
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating JSON snippet */}
          <div className="absolute bottom-8 right-8 md:right-16 bg-background/90 backdrop-blur-md p-4 rounded-lg border border-primary/30 shadow-xl z-10 hidden md:block">
            <div className="text-sm font-mono text-primary">
              {"{"}
              <br />
              &nbsp;&nbsp;"decentralized": true,
              <br />
              &nbsp;&nbsp;"verified": true,
              <br />
              &nbsp;&nbsp;"source": "filethetic"
              <br />
              {"}"}
            </div>
          </div>
        </section>

        {/* DePIN Infrastructure Section */}
        <section className="w-full py-16 md:py-24 bg-background border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-blue-500/10 px-3 py-1 text-sm text-blue-600 font-medium mb-4">
                DePIN Infrastructure
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Built on Real Decentralized Infrastructure
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Not just smart contracts—real IPFS storage providers operating physical nodes globally, earning rewards for serving the AI economy
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-4 mb-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">$200B+</h3>
                  <p className="text-sm text-muted-foreground">AI Data Market</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Server className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">4</h3>
                  <p className="text-sm text-muted-foreground">Smart Contracts</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">100%</h3>
                  <p className="text-sm text-muted-foreground">Testnet Uptime</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">3</h3>
                  <p className="text-sm text-muted-foreground">AI Providers</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/providers">View Providers</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/depin-analytics">DePIN Analytics</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                Key Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Complete DePIN Solution for AI Data
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                From AI generation to decentralized storage, blockchain verification, and NFT marketplace—all in one platform
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI Dataset Generation</h3>
                  <p className="text-muted-foreground">
                    Create high-quality synthetic datasets using OpenAI GPT-4, Anthropic Claude, and Google Gemini with built-in templates.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <LockKeyhole className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">NFT Ownership</h3>
                  <p className="text-muted-foreground">
                    Mint datasets as ERC-721 NFTs for provable ownership, automated royalties, and transparent provenance tracking.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Cryptographic Verification</h3>
                  <p className="text-muted-foreground">
                    Trusted verifier nodes validate dataset quality and authenticity with hash-based proof stored on-chain.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Decentralized Storage</h3>
                  <p className="text-muted-foreground">
                    Real infrastructure providers operate IPFS nodes globally, earning rewards for storage and bandwidth—not just smart contracts.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">USDC Marketplace</h3>
                  <p className="text-muted-foreground">
                    Buy and sell datasets with USDC payments, instant IPFS delivery, and automatic royalty distribution to creators.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-between space-y-4 rounded-lg border p-6 shadow-sm bg-background hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Earn as Provider</h3>
                  <p className="text-muted-foreground">
                    Run IPFS nodes, stake Hedera tokens, and earn passive income by providing storage and bandwidth to the network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 md:py-24 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                Process
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                How FileThetic Works
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Our platform streamlines the creation, verification, and trading of synthetic datasets
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-background shadow-lg flex items-center justify-center p-8">
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Background gradient */}
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  
                  {/* Connecting arrows */}
                  <path d="M 200 80 L 200 130" stroke="url(#arrowGradient)" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
                  <path d="M 200 180 L 200 230" stroke="url(#arrowGradient)" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
                  <path d="M 200 280 L 200 330" stroke="url(#arrowGradient)" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
                  
                  {/* Arrow marker */}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                      <polygon points="0 0, 10 5, 0 10" fill="hsl(var(--primary))" opacity="0.8" />
                    </marker>
                  </defs>
                  
                  {/* Step 1: Create/Upload - Database icon */}
                  <g transform="translate(200, 50)">
                    <circle r="25" fill="hsl(var(--primary))" opacity="0.9" />
                    <rect x="-12" y="-8" width="24" height="4" rx="2" fill="white" />
                    <rect x="-12" y="-2" width="24" height="4" rx="2" fill="white" />
                    <rect x="-12" y="4" width="24" height="4" rx="2" fill="white" />
                    <text x="35" y="5" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">1</text>
                  </g>
                  
                  {/* Step 2: IPFS Storage - Server icon */}
                  <g transform="translate(200, 150)">
                    <circle r="25" fill="hsl(var(--primary))" opacity="0.9" />
                    <rect x="-10" y="-10" width="20" height="20" rx="2" fill="none" stroke="white" strokeWidth="2" />
                    <line x1="-10" y1="-3" x2="10" y2="-3" stroke="white" strokeWidth="2" />
                    <line x1="-10" y1="3" x2="10" y2="3" stroke="white" strokeWidth="2" />
                    <circle cx="-5" cy="7" r="1.5" fill="white" />
                    <circle cx="0" cy="7" r="1.5" fill="white" />
                    <text x="35" y="5" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">2</text>
                  </g>
                  
                  {/* Step 3: Blockchain - Chain link icon */}
                  <g transform="translate(200, 250)">
                    <circle r="25" fill="hsl(var(--primary))" opacity="0.9" />
                    <rect x="-8" y="-10" width="6" height="12" rx="3" fill="none" stroke="white" strokeWidth="2" />
                    <rect x="2" y="-2" width="6" height="12" rx="3" fill="none" stroke="white" strokeWidth="2" />
                    <line x1="-2" y1="-4" x2="2" y2="2" stroke="white" strokeWidth="2" />
                    <text x="35" y="5" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">3</text>
                  </g>
                  
                  {/* Step 4: Verify & Share - Shield check icon */}
                  <g transform="translate(200, 350)">
                    <circle r="25" fill="hsl(var(--primary))" opacity="0.9" />
                    <path d="M 0,-10 L -8,0 L 0,10 L 8,0 Z" fill="none" stroke="white" strokeWidth="2" />
                    <path d="M -4,0 L -1,3 L 4,-3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="35" y="5" fontSize="14" fontWeight="bold" fill="hsl(var(--foreground))">4</text>
                  </g>
                  
                  {/* Labels */}
                  <text x="240" y="55" fontSize="12" fill="hsl(var(--muted-foreground))">Create Dataset</text>
                  <text x="240" y="155" fontSize="12" fill="hsl(var(--muted-foreground))">Store on IPFS</text>
                  <text x="240" y="255" fontSize="12" fill="hsl(var(--muted-foreground))">Publish On-Chain</text>
                  <text x="240" y="355" fontSize="12" fill="hsl(var(--muted-foreground))">Verify & Share</text>
                </svg>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">1. Create or Upload Dataset</h3>
                      <p className="text-muted-foreground">
                        Generate synthetic datasets using AI templates or upload your own JSON/CSV files through our intuitive interface.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">2. Store on IPFS Network</h3>
                      <p className="text-muted-foreground">
                        Your datasets are uploaded to IPFS through our network of storage providers, generating a unique CID for permanent access.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">3. Publish On-Chain</h3>
                      <p className="text-muted-foreground">
                        Publish your dataset metadata to the Hedera blockchain with IPFS CID, making it discoverable in the marketplace.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">4. Verify & Share</h3>
                      <p className="text-muted-foreground">
                        Use our verification system to validate dataset quality, and share access through the decentralized marketplace.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Competitive Advantages Section */}
        <section id="advantages" className="w-full py-16 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium mb-4">
                Why FileThetic
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                First-Mover in AI Data DePIN
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                The only DePIN specifically built for the AI data economy with real infrastructure and sustainable economics
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "vs. Centralized (AWS, GCP)",
                  description: "70% lower costs through P2P economics, no censorship, no single point of failure, and true data ownership through NFTs.",
                  icon: <Database className="h-10 w-10 text-primary" />,
                },
                {
                  title: "vs. General DePIN (Filecoin)",
                  description: "AI-native features with built-in verification, synthetic data generation, instant marketplace liquidity, and compute layer.",
                  icon: <Layers className="h-10 w-10 text-primary" />,
                },
                {
                  title: "vs. Data Marketplaces (Ocean)",
                  description: "Real physical infrastructure included, decentralized storage built-in, better provider economics, and purpose-built for AI.",
                  icon: <Shield className="h-10 w-10 text-primary" />,
                },
              ].map((advantage, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-4 rounded-lg border p-6 text-center shadow-sm bg-background hover:shadow-md transition-shadow"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">{advantage.icon}</div>
                  <h3 className="text-xl font-bold">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-br from-primary/10 to-primary/5 border-y">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Join the AI Data Revolution
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Be part of the first DePIN built for the $200B+ AI data economy. Whether you&apos;re creating datasets, running infrastructure, or building AI applications—FileThetic is your platform.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Button size="lg" className="bg-primary text-white hover:bg-primary/90" asChild>
                  <Link href="/create" className="flex items-center">
                    Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/marketplace" className="flex items-center">
                    Explore Datasets <Database className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/providers" className="flex items-center">
                    Become Provider <Server className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="pt-4 flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Live on Hedera Testnet</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>4 Smart Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Multi-AI Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
