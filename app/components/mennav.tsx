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
  id: 'men' | 'women';
  label: string;
  categories: Category[];
}

export const NAVIGATION_DATA: NavSection[] = [
  {
    id: 'men',
    label: 'Men',
    categories: [
      {
        name: "Bottomwears",
        slug: "bottomwears",
        subCategories: [
          { name: "Cargo Pant", slug: "cargo-pant" },
          { name: "Joggers & Track Pants", slug: "joggers-track-pants" },
          { name: "Shorts", slug: "shorts" },
          { name: "Trousers", slug: "trousers" },
        ]
      },
      {
        name: "Denim Jeans",
        slug: "denim-jeans",
        subCategories: [
          { name: "Baggy Jeans", slug: "baggy-jeans" },
          { name: "Flared Jeans", slug: "flared-jeans" },
          { name: "Relaxed Jeans", slug: "relaxed-jeans" },
          { name: "Straight Jeans", slug: "straight-jeans" },
          { name: "Slim Jeans", slug: "slim-jeans" },
          { name: "Skinny Jeans", slug: "skinny-jeans" },
        ]
      },
      {
        name: "Gym Wear",
        slug: "gym-wear",
        subCategories: [
          { name: "Gym Shorts", slug: "gym-shorts" },
          { name: "Gym T-Shirts", slug: "gym-t-shirts" },
          { name: "Sleeveless & Tank Tops", slug: "sleeveless-tank-tops" },
          { name: "Track Pants & Joggers", slug: "track-pants-joggers" },
        ]
      },
      {
        name: "T-shirts",
        slug: "t-shirts",
        subCategories: [
          { name: "Crew Neck T-Shirts", slug: "crew-neck" },
          { name: "Long Sleeve T-Shirts", slug: "long-sleeve" },
          { name: "Mock Neck T-Shirts", slug: "mock-neck" },
          { name: "Oversized T-Shirts", slug: "oversized" },
          { name: "Polo Collar T-Shirts", slug: "polo-collar" },
          { name: "V-Neck T-Shirts", slug: "v-neck" },
        ]
      },
      {
        name: "Shirts",
        slug: "shirts",
        subCategories: [] // You can add Formal/Casual sub-items later
      }
    ]
  },
  {
    id: 'Women',
    label: 'women',
    categories: [
      {
        name: "Bottomwear",
        slug: "bottomwear",
        subCategories: [
          { name: "Jeans", slug: "jeans" },
          { name: "Leggings", slug: "leggings" },
          { name: "Trousers & Pants", slug: "trousers & pants" }
        ]
      },
      {
        name: "Dresses",
        slug: "dresses",
        subCategories: [
          { name: "Casual Dresses", slug: "casual-dresses" },
          { name: "Formal Dresses", slug: "formal-dresses" }
        ]
      },
      {
        name: "Gym & Yoga Wear",
        slug: "gym-and-yoga-wear",
        subCategories: [
          { name: "Gym Tops & T-Shirts", slug: "gym-tops-and-t-shirts" },
          { name: "Leggings & Bottom Wear", slug: "leggings-and-bottom-wear" },
          { name: "Sports Bras", slug: "sports-bras" },
          { name: "workout-sets-and-co-ords", slug: "track-pants-joggers" },
        ]
      },
      {
        name: "T-Shirt",
        slug: "t-shirt",
        subCategories: [
          { name: "Graphic T-Shirts", slug: "graphic-t-shirts" },
          { name: "Oversized T-Shirt", slug: "oversized-t-shirt" },
           
          
        ]
      },
      {
        name: "Tops & Blouses",
        slug: "tops-and-blouses",
        subCategories: [
          { name: "Blouses", slug: "blouses" },
         
          
        ]
      },
      {
        name: "Women Casual Wear",
        slug: "women-casual-wear",
        subCategories: [
          { name: "Women Denim Jeans", slug: "women-denim-jeans" },
          { name: "Women Full Sleeve Tops", slug: "women-full-sleeve-tops" },
          { name: "Women Streetwear", slug: "women-streetwear" },
          
        ]
      },
     
    ]
  }
];