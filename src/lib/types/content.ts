export interface SingleContentRecord {
  id: string;
  key: string;
  is_image: boolean;
  content: string;
  image: string;
}

export type CMSContent = Record<string, string>;

export interface RaceClassHierarchy {
  id: string;
  name: string;
  description: string;
  cover: string;
  categories: {
    id: string;
    name: string;
    pits: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PrizeCategory {
  id: string;
  name: string;
  image: string;
  description: string;
  winners: {
    id: string;
    position: string;
    title: string;
    prize: number;
    description: string;
  }[];
}

export interface RegistrationStep {
  id: string;
  position: string;
  title: string;
  description: string;
}

export interface StarGuest {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}
