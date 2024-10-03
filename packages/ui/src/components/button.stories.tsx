import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRight } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Components/Button',
  argTypes: {
    onClick: { action: 'clicked' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'noShadow', 'destructive', 'outline', 'secondary', 'ghost', 'neutral', 'reverse'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary Button",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Destructive Button",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline Button",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost Button",
    variant: "ghost",
  },
};

export const NoShadow: Story = {
  args: {
    children: "No Shadow Button",
    variant: "noShadow",
  },
};

export const Neutral: Story = {
  args: {
    children: "Neutral Button",
    variant: "neutral",
  },
};

export const Reverse: Story = {
  args: {
    children: "Reverse Button",
    variant: "reverse",
  },
};

export const IconButton: Story = {
  args: {
    children: <ChevronRight />,
    variant: "outline",
    size: "icon",
  },
};

export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  },
};
