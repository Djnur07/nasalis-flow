/**
 * Centralized master data for the Nasalis Flow WEBSITE.
 *
 * This does not include NFT generator data, NFT metadata, or smart
 * contract data — it is scoped to website content only.
 */

export interface Brand {
  name: string;
  tagline: string;
  description: string;
}

export interface Collection {
  name: string;
  totalSupply: number;
  previewCount: number;
}

export interface Website {
  productionUrl: string;
}

export interface Social {
  x: string;
  github: string;
}

export interface Marketplace {
  openSea: string;
}

export interface TraitCategory {
  name: string;
  values: string[];
}

export interface Traits {
  palette: TraitCategory;
  flowStyle: TraitCategory;
  density: TraitCategory;
  noseClass: TraitCategory;
  background: TraitCategory;
  guideLine: TraitCategory;
}

export const BRAND: Brand = {
  name: "Nasalis Flow",
  tagline: "Generative portraits inspired by the proboscis monkey.",
  description:
    "Nasalis Flow is a generative art collection inspired by the distinctive character of the proboscis monkey.",
};

export const COLLECTION: Collection = {
  name: "Nasalis Flow",
  totalSupply: 5555,
  previewCount: 50,
};

export const WEBSITE: Website = {
  productionUrl: "https://nasalis-flow.vercel.app/",
};

export const SOCIAL: Social = {
  x: "https://x.com/NasalisFlow",
  github: "https://github.com/Djnur07/nasalis-flow-engine",
};

// No smart contract yet, so this stays empty.
export const MARKETPLACE: Marketplace = {
  openSea: "",
};

export const TRAITS: Traits = {
  palette: {
    name: "Palette",
    values: ["Copper Etching", "Neon Rainforest", "Sepia Ink", "Midnight Blue Mist"],
  },
  flowStyle: {
    name: "Flow Style",
    values: ["Tight Contour", "Wavy", "Turbulent"],
  },
  density: {
    name: "Density",
    values: ["Sparse", "Medium", "Dense"],
  },
  noseClass: {
    name: "Nose Class",
    values: ["Small", "Medium", "Large", "Giant"],
  },
  background: {
    name: "Background",
    values: ["Dark Void", "Starry", "Soft Mist"],
  },
  guideLine: {
    name: "Guide Line",
    values: ["Present", "Absent"],
  },
};
