export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType;
}