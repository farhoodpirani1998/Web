// shadcn/ui-style primitives (ui/) — one file per primitive, lowercase
// filenames, matching shadcn's own convention and CLI expectations.
export { Button, buttonVariants, type ButtonProps } from "./ui/button";
export { IconButton, type IconButtonProps } from "./ui/icon-button";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  type CardProps,
} from "./ui/card";
export { Badge, badgeVariants, type BadgeProps } from "./ui/badge";
export { Link, linkVariants, type LinkProps } from "./ui/link";
export { Separator, separatorVariants, type SeparatorProps } from "./ui/separator";

// Layout and typography primitives — PascalCase filenames (design-system
// components authored in-house, not generated via the shadcn/ui CLI).
export { Typography, typographyVariants, type TypographyProps } from "./Typography";
export { Heading, type HeadingProps } from "./Heading";
export { Text, type TextProps } from "./Text";
export { Container, containerVariants, type ContainerProps } from "./Container";
export { Section, sectionVariants, type SectionProps } from "./Section";
export { Stack, stackVariants, type StackProps } from "./Stack";
export { Grid, gridVariants, type GridProps } from "./Grid";

// Existing Phase 1 primitive
export { Spinner, type SpinnerProps } from "./Spinner";
