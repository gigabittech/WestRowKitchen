import { getFoodImage } from "@/utils/food-images";

export default function ImageTest() {
  const testItems = [
    "Pho Bo",
    "BBQ Bacon Burger", 
    "Fresh Spring Rolls",
    "Margherita Pizza"
  ];
  
  return (
    <div className="fixed top-4 right-4 bg-white border p-4 rounded shadow-lg z-50 max-w-sm">
      <h4 className="font-bold mb-2">Image Test</h4>
      {testItems.map(name => {
        const image = getFoodImage(name);
        return (
          <div key={name} className="mb-2 flex items-center space-x-2">
            <span className="text-sm">{name}:</span>
            {image ? (
              <img src={image} alt={name} className="w-8 h-8 object-cover rounded" />
            ) : (
              <span className="text-red-500 text-xs">No image</span>
            )}
          </div>
        );
      })}
    </div>
  );
}