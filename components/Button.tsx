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
  "inline-flex items-center justify-center gap-2 px-7 py-3 text-xs font-medium tracking-[0.25em] uppercase transition-colors duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-rust";

// "light" = for use on light/cream backgrounds (dark ink button).
// "dark" = for use on dark/noir backgrounds (bone button, original style).
const styles: Record<Tone, Record<Variant, string>> = {
  light: {
    primary: "bg-ink text-cream hover:bg-charcoal",
    outline: "border border-ink/25 text-ink hover:border-ink",
  },
  dark: {
    primary: "bg-bone text-noir hover:bg-amber",
    outline: "border border-bone/30 text-bone hover:border-bone",
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
