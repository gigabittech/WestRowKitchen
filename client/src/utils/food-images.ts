// Food image mappings
import BBQBaconBurger from "@assets/BBQ-Bacon-Burger_1756896652951.jpg";
import BuffaloWings from "@assets/Buffalo Wings_1756896652952.jpg";
import CrispyImperialRolls from "@assets/Crispy Imperial Rolls_1756896652952.jpg";
import FreshSpringRolls from "@assets/Fresh Spring Rolls _1756896652953.jpg";
import GarlicKnots from "@assets/Garlic Knots_1756896652954.jpg";
import LemongrassBeefBanhMi from "@assets/Lemongrass Beef Banh Mi _1756896652955.jpg";
import MargheritaPizza from "@assets/Margherita pizza_1756896652955.png";
import MozzarellaSticks from "@assets/Mozzarella Sticks_1756896652956.jpg";
import MushroomSwiss from "@assets/Mushroom-Swiss_1756896652956.jpg";
import OnionRings from "@assets/Onion Rings_1756896652957.jpg";
import PappisSupreme from "@assets/Pappi's Supreme_1756896652957.png";
import PhoBo from "@assets/Pho Bo_1756896652958.jpg";
import PhoGa from "@assets/Pho Ga_1756896652958.jpg";
import VermicelliBowl from "@assets/Vermicelli Bowl_1756896652959.jpg";
import CheekysClassic from "@assets/the-cheekys-classic_1756896652959.jpg";
import CrispyFries from "@assets/crispy-fries_1756896652953.jpg";
import LandedNachos from "@assets/landed-nachos_1756896652954.jpg";

// Food image mapping based on exact and partial name matches
export const foodImageMap: Record<string, string> = {
  // Exact matches (case-insensitive)
  "BBQ Bacon Burger": BBQBaconBurger,
  "Buffalo Wings": BuffaloWings,
  "Crispy Imperial Rolls": CrispyImperialRolls,
  "Fresh Spring Rolls": FreshSpringRolls,
  "Garlic Knots": GarlicKnots,
  "Lemongrass Beef Banh Mi": LemongrassBeefBanhMi,
  "Margherita Pizza": MargheritaPizza,
  "Mozzarella Sticks": MozzarellaSticks,
  "Mushroom Swiss Burger": MushroomSwiss,
  "Onion Rings": OnionRings,
  "Pappi's Supreme": PappisSupreme,
  "Pho Bo": PhoBo,
  "Pho Ga": PhoGa,
  "Vermicelli Bowl": VermicelliBowl,
  "The Cheeky's Classic": CheekysClassic,
  "Crispy Fries": CrispyFries,
  "Loaded Nachos": LandedNachos,
  
  // Additional name variations
  "BBQ Bacon": BBQBaconBurger,
  "Bacon Burger": BBQBaconBurger,
  "Wings": BuffaloWings,
  "Imperial Rolls": CrispyImperialRolls,
  "Spring Rolls": FreshSpringRolls,
  "Garlic Bread": GarlicKnots,
  "Banh Mi": LemongrassBeefBanhMi,
  "Margherita": MargheritaPizza,
  "Mozzarella": MozzarellaSticks,
  "Mushroom Swiss": MushroomSwiss,
  "Mushroom Burger": MushroomSwiss,
  "Supreme Pizza": PappisSupreme,
  "Supreme": PappisSupreme,
  "Beef Pho": PhoBo,
  "Chicken Pho": PhoGa,
  "Vermicelli": VermicelliBowl,
  "Classic Burger": CheekysClassic,
  "Cheeky's Classic": CheekysClassic,
  "Fries": CrispyFries,
  "French Fries": CrispyFries,
  "Nachos": LandedNachos,
};

// Function to get food image by name with fuzzy matching
export function getFoodImage(foodName: string): string | null {
  if (!foodName) return null;
  
  const normalizedName = foodName.trim().toLowerCase();
  
  // Try exact match first
  for (const [key, image] of Object.entries(foodImageMap)) {
    if (key.toLowerCase() === normalizedName) {
      return image;
    }
  }
  
  // Try partial matches
  for (const [key, image] of Object.entries(foodImageMap)) {
    const keyLower = key.toLowerCase();
    
    // Check if food name contains key words
    if (normalizedName.includes(keyLower) || keyLower.includes(normalizedName)) {
      return image;
    }
    
    // Check individual words
    const foodWords = normalizedName.split(/\s+/);
    const keyWords = keyLower.split(/\s+/);
    
    // If any significant word matches (length > 3)
    for (const foodWord of foodWords) {
      for (const keyWord of keyWords) {
        if (foodWord.length > 3 && keyWord.length > 3 && 
            (foodWord.includes(keyWord) || keyWord.includes(foodWord))) {
          return image;
        }
      }
    }
  }
  
  return null;
}

// Function to get all available food images for admin purposes
export function getAllFoodImages(): Array<{ name: string; image: string }> {
  return Object.entries(foodImageMap).map(([name, image]) => ({ name, image }));
}