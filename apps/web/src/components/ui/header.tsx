"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  HoveredLink,
  ProductItem,
  Menu,
  MenuItem,
} from "@/components/ui/navbar-menu";
import { Button } from "@/components/ui/Button";
import { IconMenu, IconXFilled } from "@tabler/icons-react";
import type { Dispatch, SetStateAction } from "react";

const navLinks = [
  {
    id: 1,
    title: "Services",
    links: [
      {
        id: "service-1",
        title: "Web Development",
        href: "/web-dev",
      },
      {
        id: "service-2",
        title: "Interface Design",
        href: "/interface-design",
      },
      {
        id: "service-3",
        title: "Minecraft Development",
        href: "/minecraft-dev",
      },
      {
        id: "service-4",
        title: "Full Stack Development",
        href: "/full-stack-dev",
      },
    ],
  },
  {
    id: 2,
    title: "Products",
    links: [
      {
        id: "product-1",
        title: "Defied Prism",
        href: "https://prism.defied.dev",
        src: "",
        description:
          "Choose everything, don't settle for less. Defied Prism is a comprehensive UI component library for building consistent and visually appealing user interfaces across all Defied projects.",
      },
      {
        id: "product-2",
        title: "Defied Web Configs",
        href: "https://webconfigs.defied.dev",
        src: "",
        description:
          "Access your configurations from anywhere, anytime. Defied Web Configs is a cloud-based configuration management tool that allows you to store, manage, and access your minecraft server configurations from any device with an internet connection.",
      },
    ],
  },
  {
    id: 3,
    title: "Pricing",
    links: [
      {
        id: 1,
        title: "Hobby",
        href: "/hobby",
      },
      {
        id: 2,
        title: "Individual",
        href: "/individual",
      },
      {
        id: 3,
        title: "Team",
        href: "/team",
      },
      {
        id: 4,
        title: "Enterprise",
        href: "/enterprise",
      },
    ],
  },
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 mx-auto w-full lg:max-w-7xl flex items-center md:justify-between justify-evenly gap-6 px-10 py-4 sm:px-6 lg:px-8 bg-background/70 backdrop-blur-md lg:rounded-2xl lg:mt-5 box-border">
      <div className="whitespace-pre">
        <h1 className="text-xl font-bold">Defied</h1>
      </div>
      <div className="flex items-center gap-8 text-[15px] font-medium leading-[1.2em] text-[#5B6270] dark:text-[#D9D9D9]">
        <HeaderLinks className="hidden md:flex" />
      </div>
      <div className="md:flex items-center gap-4 hidden">
        <a href="/auth/magic-link">
          <Button className="py-5.5 px-6 text-white text-[16px] font-semibold rounded-[10px] cursor-pointer tracking-tight box-border">
            Sign In
          </Button>
        </a>
      </div>
      <div className="md:hidden flex">
        <Button onClick={() => setIsOpen((o) => !o)}>
          <IconMenu />
        </Button>
      </div>
      <MobileNavbar open={isOpen} setOpen={setIsOpen} />
    </header>
  );
}

function HeaderLinks({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn("relative max-w-2xl", className)}>
      <Menu
        setActive={setActive}
        className="mb-40 text-3xl uppercase font-bold lg:mb-0 lg:text-base lg:normal-case lg:font-normal"
      >
        {navLinks.map((navLink) => (
          <MenuItem
            key={navLink.id}
            setActive={setActive}
            active={active}
            item={navLink.title}
          >
            <div
              className={cn(
                "flex flex-col space-y-4 text-sm",
                navLink.title.toLowerCase() === "products"
                  ? "grid grid-cols-2 gap-10 p-4 text-sm"
                  : "",
              )}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {navLink.links.map((link: any) => (
                <>
                  {!link.src ? (
                    <HoveredLink key={link.id} href={link.href}>
                      {link.title}
                    </HoveredLink>
                  ) : (
                    <ProductItem
                      key={link.id}
                      title={link.title}
                      description={link.description}
                      href={link.href}
                      src={link.src}
                    />
                  )}
                </>
              ))}
            </div>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

function MobileNavbar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className={cn(
        "fixed z-50 w-screen h-screen bg-background lg:hidden transition-all duration-1000 ease-in-out top-0 bottom-0",
        open ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex flex-col w-full justify-end h-full py-20">
        <HeaderLinks />
        <Button
          className="py-10 w-[90%] mx-auto"
          onClick={() => setOpen(false)}
        >
          <IconXFilled />
        </Button>
      </div>
    </div>
  );
}

export default Header;
