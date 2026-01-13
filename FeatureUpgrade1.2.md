# Feature Upgrade 1.2

Tambahkan fitur terima barang dan terintegrasi dengan berkurangnya saldo pada fitur finance dan tertambahnya stok produk pada fitur product.

integrasikan fitur kasir transaksi dengan fitur finance. untuk menambahkan pendapatan bersih ke finance.

enhance semua halaman tampilan dengan menggunakan shadcn ui dengan theme ini

@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.5rem;
  --background: oklch(1.000 0.000 0);
  --foreground: oklch(0.149 0.004 120.42181262048044);
  --card: oklch(1.000 0.000 0);
  --card-foreground: oklch(0.149 0.004 120.42181262048044);
  --popover: oklch(1.000 0.000 0);
  --popover-foreground: oklch(0.149 0.004 120.42181262048044);
  --primary: oklch(0.789 0.205 127.8584997199149);
  --primary-foreground: oklch(0.964 0.003 120.0983436586244);
  --secondary: oklch(0.885 0.032 120.64412920968522);
  --secondary-foreground: oklch(0.239 0.028 122.14269740223335);
  --muted: oklch(0.885 0.032 120.64412920968522);
  --muted-foreground: oklch(0.638 0.097 122.85359879491814);
  --accent: oklch(0.839 0.179 139.61535651834467);
  --accent-foreground: oklch(0.245 0.053 139.62226792353908);
  --destructive: oklch(0.580 0.237 28.43022926835137);
  --border: oklch(0.872 0.035 120.72405260276297);
  --input: oklch(0.872 0.035 120.72405260276297);
  --ring: oklch(0.789 0.205 127.8584997199149);
  --chart-1: oklch(0.789 0.205 127.8584997199149);
  --chart-2: oklch(0.850 0.175 124.31842043606166);
  --chart-3: oklch(0.867 0.121 122.57879508395051);
  --chart-4: oklch(0.594 0.149 126.85455513858523);
  --chart-5: oklch(0.446 0.110 126.40571211628297);
  --sidebar: oklch(0.885 0.032 120.64412920968522);
  --sidebar-foreground: oklch(0.239 0.028 122.14269740223335);
  --sidebar-primary: oklch(0.789 0.205 127.8584997199149);
  --sidebar-primary-foreground: oklch(0.964 0.003 120.0983436586244);
  --sidebar-accent: oklch(0.839 0.179 139.61535651834467);
  --sidebar-accent-foreground: oklch(0.245 0.053 139.62226792353908);
  --sidebar-border: oklch(0.872 0.035 120.72405260276297);
  --sidebar-ring: oklch(0.789 0.205 127.8584997199149);
}

.dark {
  --background: oklch(0.212 0.023 121.98606539081248);
  --foreground: oklch(0.964 0.003 120.0983436586244);
  --card: oklch(0.265 0.033 122.26227411146496);
  --card-foreground: oklch(0.964 0.003 120.0983436586244);
  --popover: oklch(0.265 0.033 122.26227411146496);
  --popover-foreground: oklch(0.964 0.003 120.0983436586244);
  --primary: oklch(0.827 0.211 127.2134726498498);
  --primary-foreground: oklch(0.964 0.003 120.0983436586244);
  --secondary: oklch(0.297 0.034 122.03741530208285);
  --secondary-foreground: oklch(0.970 0.010 120.21833172348938);
  --muted: oklch(0.297 0.034 122.03741530208285);
  --muted-foreground: oklch(0.753 0.038 120.9027292575858);
  --accent: oklch(0.825 0.241 140.22801221205688);
  --accent-foreground: oklch(0.970 0.020 139.43879520892506);
  --destructive: oklch(0.580 0.237 28.43022926835137);
  --border: oklch(0.421 0.060 122.65041209425861);
  --input: oklch(0.421 0.060 122.65041209425861);
  --ring: oklch(0.827 0.211 127.2134726498498);
  --chart-1: oklch(0.827 0.211 127.2134726498498);
  --chart-2: oklch(0.889 0.175 124.04643769168126);
  --chart-3: oklch(0.925 0.139 122.82196667620488);
  --chart-4: oklch(0.616 0.143 125.50493370745731);
  --chart-5: oklch(0.457 0.092 124.16034907426483);
  --sidebar: oklch(0.363 0.050 122.54890706621607);
  --sidebar-foreground: oklch(0.964 0.003 120.0983436586244);
  --sidebar-primary: oklch(0.827 0.211 127.2134726498498);
  --sidebar-primary-foreground: oklch(0.964 0.003 120.0983436586244);
  --sidebar-accent: oklch(0.825 0.241 140.22801221205688);
  --sidebar-accent-foreground: oklch(0.970 0.020 139.43879520892506);
  --sidebar-border: oklch(0.421 0.060 122.65041209425861);
  --sidebar-ring: oklch(0.827 0.211 127.2134726498498);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}