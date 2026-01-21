import { useState } from 'react';
import { LocationSuggestion } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  X, 
  Buildings, 
  Flag, 
  MapTrifold, 
  Storefront,
  CheckCircle,
  Sparkle,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationPanelProps {
  suggestions: LocationSuggestion[] | null;
  manualLocations: string[] | null;
  confirmedLocations: string[];
  onAddManualLocation: (location: string) => void;
  onRemoveManualLocation: (location: string) => void;
  onConfirmSuggestion: (suggestion: LocationSuggestion) => void;
  onDismissSuggestion: (suggestionName: string) => void;
  isLocked: boolean;
}

const TYPE_ICONS: Record<LocationSuggestion['type'], React.ReactNode> = {
  city: <Buildings weight="duotone" className="w-3.5 h-3.5" />,
  neighborhood: <MapTrifold weight="duotone" className="w-3.5 h-3.5" />,
  landmark: <MapPin weight="duotone" className="w-3.5 h-3.5" />,
  venue: <Storefront weight="duotone" className="w-3.5 h-3.5" />,
  country: <Flag weight="duotone" className="w-3.5 h-3.5" />,
};

const TYPE_LABELS: Record<LocationSuggestion['type'], string> = {
  city: 'City',
  neighborhood: 'Neighborhood',
  landmark: 'Landmark',
  venue: 'Venue',
  country: 'Country',
};

const CONFIDENCE_COLORS: Record<LocationSuggestion['confidence'], string> = {
  high: 'bg-green-500/20 text-green-700 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  low: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
};

export function LocationPanel({
  suggestions,
  manualLocations,
  confirmedLocations,
  onAddManualLocation,
  onRemoveManualLocation,
  onConfirmSuggestion,
  onDismissSuggestion,
  isLocked
}: LocationPanelProps) {
  const [newLocation, setNewLocation] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const handleAddLocation = () => {
    if (newLocation.trim() && !isLocked) {
      onAddManualLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLocation();
    }
  };

  const handleDismiss = (name: string) => {
    setDismissedSuggestions(prev => new Set([...prev, name]));
    onDismissSuggestion(name);
  };

  const activeSuggestions = (suggestions || []).filter(
    s => !dismissedSuggestions.has(s.name) && !confirmedLocations.includes(s.name)
  );

  const hasContent = (manualLocations && manualLocations.length > 0) || 
                     activeSuggestions.length > 0 || 
                     confirmedLocations.length > 0;

  if (!hasContent && isLocked) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <MapPin className="w-5 h-5 text-primary" weight="duotone" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-sm">Locations</h4>
            <p className="text-xs text-muted-foreground">
              {confirmedLocations.length + (manualLocations?.length || 0)} tagged
              {activeSuggestions.length > 0 && ` • ${activeSuggestions.length} suggestions`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <CaretUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <CaretDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-4">
              {(confirmedLocations.length > 0 || (manualLocations && manualLocations.length > 0)) && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                    Your Locations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {confirmedLocations.map((loc) => (
                      <Badge 
                        key={loc} 
                        variant="default" 
                        className="gap-1.5 py-1.5 px-3 bg-primary/90 hover:bg-primary"
                      >
                        <CheckCircle weight="fill" className="w-3.5 h-3.5" />
                        {loc}
                        {!isLocked && (
                          <button
                            onClick={() => onRemoveManualLocation(loc)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {manualLocations?.filter(loc => !confirmedLocations.includes(loc)).map((loc) => (
                      <Badge 
                        key={loc} 
                        variant="secondary" 
                        className="gap-1.5 py-1.5 px-3"
                      >
                        <MapPin weight="duotone" className="w-3.5 h-3.5" />
                        {loc}
                        {!isLocked && (
                          <button
                            onClick={() => onRemoveManualLocation(loc)}
                            className="ml-1 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeSuggestions.length > 0 && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkle weight="fill" className="w-3 h-3 text-accent" />
                    AI Suggestions
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Tap to confirm locations detected from your photos or story
                  </p>
                  <div className="space-y-2">
                    {activeSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border bg-card/60",
                          "hover:bg-card/80 transition-colors group"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-muted">
                            {TYPE_ICONS[suggestion.type]}
                          </div>
                          <div>
                            <span className="font-medium text-sm">{suggestion.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">
                                {TYPE_LABELS[suggestion.type]}
                              </span>
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full border",
                                CONFIDENCE_COLORS[suggestion.confidence]
                              )}>
                                {suggestion.confidence}
                              </span>
                              {suggestion.source === 'image' && (
                                <span className="text-xs text-muted-foreground italic">
                                  from photo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isLocked && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDismiss(suggestion.name)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onConfirmSuggestion(suggestion)}
                              className="h-8 gap-1.5 bg-primary/90 hover:bg-primary"
                            >
                              <CheckCircle weight="fill" className="w-4 h-4" />
                              Confirm
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {!isLocked && (
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2 block">
                    Add Location Manually
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="e.g., Shibuya Crossing, Tokyo"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddLocation}
                      disabled={!newLocation.trim()}
                      size="icon"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Be specific! Add neighborhood names, landmarks, or exact venues to help freshen your memory later.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
