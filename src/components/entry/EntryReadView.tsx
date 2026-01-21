import { Entry, Photo } from '@/lib/types';
import { formatDate, getEntryTitle } from '@/lib/entries';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CalendarBlank, MapPin, User, Sparkle } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface EntryReadViewProps {
  entry: Entry;
}

export function EntryReadView({ entry }: EntryReadViewProps) {
  const title = getEntryTitle(entry);
  const tags = entry.tags_ai;
  const allLocations = [
    ...(entry.manual_locations || []),
    ...(tags?.places || [])
  ].filter((loc, idx, arr) => arr.indexOf(loc) === idx);

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      {entry.photos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <ReadOnlyPhotoGallery photos={entry.photos} />
        </motion.div>
      )}

      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <CalendarBlank weight="duotone" className="w-4 h-4" />
            {formatDate(entry.date)}
          </span>
          {allLocations.length > 0 && (
            <span className="flex items-center gap-1.5">
              <MapPin weight="duotone" className="w-4 h-4" />
              {allLocations.slice(0, 2).join(' · ')}
              {allLocations.length > 2 && ` +${allLocations.length - 2}`}
            </span>
          )}
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
          {title}
        </h1>
      </motion.header>

      {entry.highlights_ai && entry.highlights_ai.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10"
        >
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkle weight="fill" className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Highlights</span>
            </div>
            <ul className="space-y-3">
              {entry.highlights_ai.map((highlight, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span className="text-foreground leading-relaxed">{highlight}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.section>
      )}

      {entry.story_ai && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10"
        >
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground leading-[1.8] text-lg first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary">
              {entry.story_ai}
            </p>
          </div>
        </motion.section>
      )}

      {tags && (tags.people.length > 0 || tags.places.length > 0 || tags.moods.length > 0 || tags.themes.length > 0) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-border/50"
        >
          <div className="flex flex-wrap gap-2">
            {tags.people.map(tag => (
              <Badge key={`person-${tag}`} variant="secondary" className="text-sm py-1.5 px-3">
                <User weight="duotone" className="w-3.5 h-3.5 mr-1.5" />
                {tag}
              </Badge>
            ))}
            {tags.places.map(tag => (
              <Badge key={`place-${tag}`} variant="secondary" className="text-sm py-1.5 px-3">
                <MapPin weight="duotone" className="w-3.5 h-3.5 mr-1.5" />
                {tag}
              </Badge>
            ))}
            {tags.moods.map(tag => (
              <Badge key={`mood-${tag}`} variant="outline" className="text-sm py-1.5 px-3">
                {tag}
              </Badge>
            ))}
            {tags.themes.map(tag => (
              <Badge key={`theme-${tag}`} variant="outline" className="text-sm py-1.5 px-3 bg-muted/50">
                {tag}
              </Badge>
            ))}
          </div>
        </motion.section>
      )}

      {entry.transcript && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 pt-8 border-t border-border/30"
        >
          <details className="group">
            <summary className="text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Original Notes
            </summary>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed italic">
              "{entry.transcript}"
            </p>
          </details>
        </motion.section>
      )}
    </motion.article>
  );
}

function ReadOnlyPhotoGallery({ photos }: { photos: Photo[] }) {
  if (photos.length === 1) {
    return (
      <div className="relative rounded-2xl overflow-hidden shadow-xl">
        <img 
          src={photos[0].storage_url} 
          alt="" 
          className="w-full max-h-[600px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  if (photos.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden">
        {photos.map((photo, idx) => (
          <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
            <img 
              src={photo.storage_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
          </div>
        ))}
      </div>
    );
  }

  const mainPhoto = photos[0];
  const sidePhotos = photos.slice(1, 5);
  const remainingCount = photos.length - 5;

  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
      <div className="col-span-2 row-span-2 relative overflow-hidden rounded-xl shadow-lg">
        <img 
          src={mainPhoto.storage_url} 
          alt="" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
      </div>
      {sidePhotos.map((photo, idx) => (
        <div key={photo.id} className="relative overflow-hidden rounded-xl shadow-md">
          <img 
            src={photo.storage_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
          {idx === sidePhotos.length - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">+{remainingCount}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
