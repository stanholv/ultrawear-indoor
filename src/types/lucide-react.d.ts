declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export type Icon = ComponentType<IconProps>;

  // Common icons used in the app
  export const Trophy: Icon;
  export const Target: Icon;
  export const Award: Icon;
  export const Users: Icon;
  export const Facebook: Icon;
  export const BarChart2: Icon;
  export const Star: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const Plus: Icon;
  export const Minus: Icon;
  export const Calendar: Icon;
  export const Clock: Icon;
  export const Save: Icon;
  export const AlertCircle: Icon;
  export const Info: Icon;
  export const Home: Icon;
  export const TrendingUp: Icon;
  export const TrendingDown: Icon;
  export const Filter: Icon;
  export const Shield: Icon;
  export const Moon: Icon;
  export const Sun: Icon;
  export const LogOut: Icon;
  export const User: Icon;
  export const LogIn: Icon;
  export const ArrowLeft: Icon;
  export const Flag: Icon;
  export const Crosshair: Icon;
  export const ChevronDown: Icon;
  export const Edit2: Icon;
  export const Check: Icon;
  export const X: Icon;
}