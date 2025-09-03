import NavigationHeader from "@/components/navigation-header";
import LoadingSpinner from "@/components/loading-spinner";

interface PageLoaderProps {
  text?: string;
  showHeader?: boolean;
}

export default function PageLoader({ 
  text = "Loading...", 
  showHeader = true 
}: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <NavigationHeader 
          isCartOpen={false}
          setIsCartOpen={() => {}}
          cartItemCount={0}
        />
      )}
      
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{text}</h2>
          <p className="mt-2 text-gray-600">Please wait while we load the content</p>
        </div>
      </div>
    </div>
  );
}