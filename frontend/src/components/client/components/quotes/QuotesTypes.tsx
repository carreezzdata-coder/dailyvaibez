export interface Quote {
  quote_id: number;
  quote_text: string;
  sayer_name: string;
  sayer_title: string;
  sayer_image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteCardProps {
  quote: Quote;
  index: number;
  tier: string;
  themeColor: string;
  onCardClick: (quote: Quote, index: number) => void;
}

export interface QuoteModalProps {
  selectedQuote: Quote | null;
  currentIndex: number;
  totalQuotes: number;
  themeColor: string;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  posterRef: React.RefObject<HTMLDivElement>;
}

export interface QuoteSidebarProps {
  quotes: Quote[];
  type: 'striking' | 'trending';
  onQuoteClick: (quote: Quote) => void;
}

export interface QuotesControlsProps {
  viewMode: string;
  itemsPerPage: number;
  onViewModeChange: (mode: string) => void;
  onItemsPerPageChange: (count: number) => void;
}