import { Button } from '@/components/ui/button';

interface StandingsPaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  threshold?: number;
}

const StandingsPagination = ({ page, totalItems, pageSize, onPageChange, threshold = 5 }: StandingsPaginationProps) => {
  if (totalItems <= threshold) return null;

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => onPageChange(page - 1)} className="font-racing text-xs">
        PREV
      </Button>
      <span className="flex items-center text-sm text-muted-foreground font-racing">
        LAP {page + 1}/{totalPages}
      </span>
      <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)} className="font-racing text-xs">
        NEXT
      </Button>
    </div>
  );
};

export default StandingsPagination;
