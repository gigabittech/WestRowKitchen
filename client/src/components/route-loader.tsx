import { useRouteLoading } from "@/hooks/useRouteLoading";
import PageLoader from "@/components/page-loader";

interface RouteLoaderProps {
  children: React.ReactNode;
}

export default function RouteLoader({ children }: RouteLoaderProps) {
  const { isLoading } = useRouteLoading();

  return (
    <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      {isLoading ? (
        <PageLoader text="Loading page..." />
      ) : (
        children
      )}
    </div>
  );
}