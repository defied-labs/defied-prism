import stats from "@/generated/stats.json";
import { ModeToggle } from "@/components/mode-toggle";
import { Command } from "@/components/site/copy-button";
import { Gallery } from "@/components/site/gallery";
import { Install } from "@/components/site/install";
import { HeroPrism } from "@/components/site/hero-prism";
import { MachineVisualizer } from "@/components/site/machine-visualizer";
import { StackMatrix } from "@/components/site/stack-matrix";
import Section from "@/components/home/Section";

export default function Home() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-40 bg-background/70 backdrop-blur">
        <nav
          aria-label="Main"
          className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6"
        >
          <a href="#top" className="font-lora text-lg">
            Defied <span className="text-primary">Prism</span>
          </a>
          <ul className="hidden gap-5 text-sm font-medium text-foreground/80 md:flex">
            <li>
              <a className="hover:text-foreground" href="#matrix">
                Matrix
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#machine">
                Machines
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#components">
                Components
              </a>
            </li>
            <li>
              <a className="hover:text-foreground" href="#install">
                Install
              </a>
            </li>
          </ul>
          <div className="col-start-3 flex items-center justify-self-end gap-3">
            <ModeToggle />
            <a
              href="#install"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section
          aria-labelledby="hero-title"
          className="group/hero relative grid min-h-screen items-center overflow-hidden px-4 has-data-prism:grid-cols-2 lg:px-20"
        >
          <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-20 text-center sm:px-16 sm:pt-28 group-has-data-prism/hero:max-w-none group-has-data-prism/hero:text-left">
            <h1 className="mt-5 font-lora text-4xl leading-[1.05] tracking-tight">
              Every{" "}
              <span className="text-primary">
                design system picks your stack
              </span>{" "}
              <br />
              Prism lets you pick{" "}
              <span className="italic text-primary">yours</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground">
              The same accessible components, generated for React or Vue, styled
              with Tailwind or CSS Modules, written into your repo as code you
              own, not code that owns you.
            </p>
            <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center group-has-data-prism/hero:mx-0">
              <div className="flex-1">
                <Command>npx @defied/prism-cli init</Command>
              </div>
              <a
                href="#matrix"
                className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
              >
                See it switch stacks
              </a>
            </div>
          </div>
          <HeroPrism
            animationType="hover"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={1.2}
            hueShift={0}
            colorFrequency={0.25}
            noise={0}
            glow={1}
          />
        </section>

        <Section
          id="matrix"
          kicker="Flexibility"
          title={
            <>
              One registry.{" "}
              <span className="italic text-primary">Any stack.</span> Live.
            </>
          }
          lead={
            <>
              Pick a component, then a framework and a styling engine. The
              preview is the real generated component running in that framework;
              the code is exactly what <code>prism add</code> writes, produced
              by the CLI when this site was built.
            </>
          }
        >
          <StackMatrix />
        </Section>

        <Section
          id="machine"
          kicker="Architecture"
          band
          title={
            <>
              One <span className="italic text-primary">state machine</span>{" "}
              underneath every target.
            </>
          }
          lead="Where a component has real states with timing or ordering, like a tooltip or a combobox, its logic is a typed state machine in the core, and React and Vue are thin adapters over it. Everything else shares framework-agnostic primitives for focus trapping, dismissal and keyboard navigation. Watch both frameworks walk the same states."
        >
          <MachineVisualizer />
        </Section>

        <Section
          id="components"
          kicker="Components"
          title={
            <>
              Accessible by{" "}
              <span className="italic text-primary">contract</span>, not by
              promise.
            </>
          }
          lead="Every registry component is generated for every CSS target in CI, rendered, and checked against its manifest contract and axe. Badges show which frameworks each one ships for today."
        >
          <Gallery vueReady={stats.vueReady} />
        </Section>

        <Section
          id="scale"
          kicker="Scalability"
          band
          title={
            <>
              Built to grow{" "}
              <span className="italic text-primary">without forking</span>.
            </>
          }
          lead="New frameworks are new templates over the same machines and recipes, not a rewrite. These numbers are counted from the registry at build time."
        >
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border lg:grid-cols-4">
            {[
              [stats.components, "components in the registry"],
              [stats.vueComponents, "of them generate for Vue today"],
              [stats.stylings, "styling targets from one recipe"],
              [stats.machines, "standalone state machines in the core"],
            ].map(([value, label]) => (
              <div key={label} className="bg-card p-6">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="order-first font-lora text-4xl">{value}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section
          id="install"
          kicker="Get started"
          title={
            <>
              Three commands to your{" "}
              <span className="italic text-primary">first component</span>.
            </>
          }
          lead="Prism writes components into your project. Edit them freely; regenerate when you want the latest."
        >
          <div className="mx-auto max-w-2xl">
            <Install />
          </div>
        </Section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:flex-row sm:justify-between sm:px-6">
          <div>
            <p className="font-lora text-lg">
              Defied <span className="text-primary">Prism</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick your stack. Own your code.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            {[
              [
                "Product",
                [
                  ["Matrix", "#matrix"],
                  ["Machines", "#machine"],
                  ["Components", "#components"],
                ],
              ],
              [
                "Start",
                [
                  ["Install", "#install"],
                  ["Scale", "#scale"],
                ],
              ],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <p className="font-medium">{heading as string}</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {(links as string[][]).map(([label, href]) => (
                    <li key={href}>
                      <a className="hover:text-foreground" href={href}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-6xl border-t px-4 py-6 text-sm text-muted-foreground sm:px-6">
          © 2026 Defied. Built in the open, with Prism&apos;s own components in
          React and Vue.
        </div>
      </footer>
    </div>
  );
}
