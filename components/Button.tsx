import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Tone = "light" | "dark";
type Variant = "primary" | "outline";

type CommonProps = {
  variant?: Variant;
  tone?: Tone;
  className?: string;
};

type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs font-medium tracking-[0.2em] uppercase transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

const styles: Record<Tone, Record<Variant, string>> = {
  light: {
    primary: "bg-ink text-cream hover:bg-gold hover:text-ink",
    outline: "border border-ink/25 text-ink hover:border-ink",
  },
  dark: {
    primary: "bg-cream text-ink hover:bg-gold hover:text-ink",
    outline: "border border-cream/30 text-cream hover:border-cream",
  },
};

export function Button({ variant = "primary", tone = "light", className = "", ...props }: LinkProps | ButtonProps) {
  const classes = `${base} ${styles[tone][variant]} ${className}`;

  if (props.href) {
    const { href, children, ...rest } = props as LinkProps;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { children, type = "button", ...rest } = props as ButtonProps;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
