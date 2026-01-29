// app/constants/navigation.ts

export interface SubCategory {
  name: string;
  slug: string;
}

export interface Category {
  name: string;
  slug: string;
  subCategories?: SubCategory[];
}

export interface NavSection {
  id: "men" | "women";
  label: string;
  categories: Category[];
}

export const NAVIGATION_DATA: NavSection[] = [
  {
    id: "men",
    label: "Men",
    categories: [
      {
        name: "Bottomwears",
        id: "6976fc10f4ef7b0470021c03",
        slug: "bottomwears",
        subCategories: [
          { name: "Cargo Pant", slug: "cargo-pant" },
          { name: "Joggers & Track Pants", slug: "joggers-track-pants" },
          { name: "Shorts", slug: "shorts" },
          { name: "Trousers", slug: "trousers" },
        ],
      },
      {
        name: "Denim Jeans",
        id: "6976fd3cf4ef7b0470021c3f",
        slug: "denim-jeans",
        subCategories: [
          { name: "Baggy Jeans", slug: "baggy-jeans" },
          { name: "Flared Jeans", slug: "flared-jeans" },
          { name: "Relaxed Jeans", slug: "relaxed-jeans" },
          { name: "Straight Jeans", slug: "straight-jeans" },
          { name: "Slim Jeans", slug: "slim-jeans" },
          { name: "Skinny Jeans", slug: "skinny-jeans" },
        ],
      },
      {
        name: "Gym Wear",
        id: "6976fc10f4ef7b0470021c03",
        slug: "gym-wear",
        subCategories: [
          { name: "Gym Shorts", slug: "gym-shorts" },
          { name: "Gym T-Shirts", slug: "gym-t-shirts" },
          { name: "Sleeveless & Tank Tops", slug: "sleeveless-tank-tops" },
          { name: "Track Pants & Joggers", slug: "track-pants-joggers" },
        ],
      },
      {
        name: "T-shirts",
        id: "6976fc10f4ef7b0470021c03",
        slug: "t-shirts",
        subCategories: [
          { name: "Crew Neck T-Shirts", slug: "crew-neck" },
          { name: "Long Sleeve T-Shirts", slug: "long-sleeve" },
          { name: "Mock Neck T-Shirts", slug: "mock-neck" },
          { name: "Oversized T-Shirts", slug: "oversized" },
          { name: "Polo Collar T-Shirts", slug: "polo-collar" },
          { name: "V-Neck T-Shirts", slug: "v-neck" },
        ],
      },
      {
        name: "Shirts",
        id: "6976fc10f4ef7b0470021c03",
        slug: "shirts",
        subCategories: [], // You can add Formal/Casual sub-items later
      },
    ],
  },
  {
    id: "Women",
    label: "women",
    categories: [
      {
        name: "Bottomwear",
        id: "6976fc10f4ef7b0470021c03",
        slug: "bottomwear",
        subCategories: [
          { name: "Jeans", slug: "jeans" },
          { name: "Leggings", slug: "leggings" },
          { name: "Trousers & Pants", slug: "trousers & pants" },
        ],
      },
      {
        name: "Dresses",
        id: "6976fd3cf4ef7b0470021c3f",
        slug: "dresses",
        subCategories: [
          { name: "Casual Dresses", slug: "casual-dresses" },
          { name: "Formal Dresses", slug: "formal-dresses" },
        ],
      },
      {
        name: "One-Piece",
        id: "6976fd92f4ef7b0470021c70",
        slug: "one-piec",
        subCategories: [
          { name: "Bodycon", slug: "bodycon" },
          { name: "Jumpsuits", slug: "jumpsuits" },
          { name: "Rompers", slug: "rompers" },
          
        ],
      },
      {
        name: "Gym & Yoga Wear",
        id: "697070941f5a5041630aca12",
        slug: "gym-and-yoga-wear",
        subCategories: [
          { name: "Gym Tops & T-Shirts", slug: "gym-tops-and-t-shirts" },
          { name: "Leggings & Bottom Wear", slug: "leggings-and-bottom-wear" },
          { name: "Sports Bras", slug: "sports-bras" },
          { name: "workout-sets-and-co-ords", slug: "track-pants-joggers" },
        ],
      },
      {
        name: "T-Shirt",
        id: "6970ce9a1f5a5041630acc9a",
        slug: "t-shirt",
        subCategories: [
          { name: "Graphic T-Shirts", slug: "graphic-t-shirts" },
          { name: "Oversized T-Shirt", slug: "oversized-t-shirt" },
        ],
      },
      {
        name: "Tops & Blouses",
        id: "6976fc91f4ef7b0470021c24",
        slug: "tops-and-blouses",
        subCategories: [{ name: "Blouses", slug: "blouses" }],
      },
      {
        name: "Women Casual Wear",
        id: "6976f7eaf4ef7b0470021b1b",
        slug: "women-casual-wear",
        subCategories: [
          { name: "Women Denim Jeans", slug: "women-denim-jeans" },
          { name: "Women Full Sleeve Tops", slug: "women-full-sleeve-tops" },
          { name: "Women Streetwear", slug: "women-streetwear" },
        ],
      },
    ],
  },
];
