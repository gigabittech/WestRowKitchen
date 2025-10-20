import { Button } from "@/components/ui/button";

interface Category {
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCuisine: string;
  onCuisineChange: (cuisine: string) => void;
}

export default function CategoryFilter({ categories, selectedCuisine, onCuisineChange }: CategoryFilterProps) {
  return (
    <section className="py-8 bg-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Cuisine We have in our Kitchen</h2>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button 
            onClick={() => onCuisineChange("ALL")}
            className={selectedCuisine === "ALL" ? "btn-primary" : "bg-white text-gray-600 hover:bg-primary hover:text-white"}
          >
            ALL
          </Button>
          {categories.map((category) => (
            <Button 
              key={category.name}
              onClick={() => onCuisineChange(category.name)}
              className={selectedCuisine === category.name ? "btn-primary" : "bg-white text-gray-600 hover:bg-primary hover:text-white"}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <div 
              key={category.name}
              onClick={() => onCuisineChange(category.name)}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <p className="text-sm font-medium">{category.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
