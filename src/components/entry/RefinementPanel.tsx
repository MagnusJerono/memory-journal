import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Microphone, Stop, PaperPlaneTilt, X, ChatCircleDots, Spinner, ArrowRight } from '@phosphor-icons/react';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from './AudioWaveform';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SPEECH_LANGUAGES = [
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', label: '中文 (简体)', flag: '🇨🇳' },
];

interface QuestionAnswer {
  question: string;
  answer: string;
}

interface RefinementPanelProps {
  questions: string[];
  speechLanguage: string;
  onSpeechLanguageChange: (lang: string) => void;
  onSubmitAnswers: (answers: QuestionAnswer[]) => void;
  isRegenerating: boolean;
  isLocked: boolean;
}

export function RefinementPanel({
  questions,
  speechLanguage,
  onSpeechLanguageChange,
  onSubmitAnswers,
  isRegenerating,
  isLocked
}: RefinementPanelProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeRecordingIndex, setActiveRecordingIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    isSupported: speechSupported,
    transcript: speechTranscript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    audioLevel
  } = useSpeechToText(speechLanguage);

  useEffect(() => {
    if (speechTranscript && activeRecordingIndex !== null) {
      setAnswers(prev => ({
        ...prev,
        [activeRecordingIndex]: (prev[activeRecordingIndex] || '') + 
          ((prev[activeRecordingIndex] && !prev[activeRecordingIndex].endsWith(' ')) ? ' ' : '') + 
          speechTranscript
      }));
      resetTranscript();
    }
  }, [speechTranscript, activeRecordingIndex, resetTranscript]);

  const toggleRecording = (index: number) => {
    if (isListening && activeRecordingIndex === index) {
      stopListening();
      setActiveRecordingIndex(null);
    } else {
      if (isListening) {
        stopListening();
      }
      setActiveRecordingIndex(index);
      setExpandedQuestion(index);
      startListening();
    }
  };

  const handleExpandQuestion = (index: number) => {
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(index);
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    const answeredQuestions: QuestionAnswer[] = questions
      .map((question, index) => ({
        question,
        answer: answers[index] || ''
      }))
      .filter(qa => qa.answer.trim().length > 0);

    if (answeredQuestions.length === 0) {
      return;
    }

    onSubmitAnswers(answeredQuestions);
  };

  const hasAnyAnswer = Object.values(answers).some(a => a.trim().length > 0);
  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length;

  if (questions.length === 0 || isLocked) {
    return null;
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-accent/15 via-accent/10 to-transparent border-accent/30 shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-accent/20">
          <Lightbulb className="w-5 h-5 text-accent" weight="fill" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">Make this story even better</h4>
          <p className="text-xs text-muted-foreground">
            Answer these questions to add more details. You can type or speak your answers.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => {
          const isExpanded = expandedQuestion === index;
          const isRecording = isListening && activeRecordingIndex === index;
          const hasAnswer = (answers[index] || '').trim().length > 0;
          const displayValue = isRecording 
            ? (answers[index] || '') + ((answers[index] && interimTranscript) ? ' ' : '') + interimTranscript
            : (answers[index] || '');

          return (
            <motion.div
              key={index}
              layout
              className={cn(
                "rounded-lg border transition-all",
                isExpanded 
                  ? "bg-card/80 border-accent/40 shadow-sm" 
                  : hasAnswer 
                    ? "bg-card/60 border-primary/30" 
                    : "bg-card/40 border-border/50 hover:border-border"
              )}
            >
              <button
                onClick={() => handleExpandQuestion(index)}
                className="w-full p-3 flex items-start gap-3 text-left"
              >
                <ChatCircleDots 
                  className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0 transition-colors",
                    hasAnswer ? "text-primary" : "text-muted-foreground"
                  )} 
                  weight={hasAnswer ? "fill" : "regular"}
                />
                <span className={cn(
                  "flex-1 text-sm",
                  hasAnswer ? "text-foreground" : "text-muted-foreground"
                )}>
                  {question}
                </span>
                {hasAnswer && !isExpanded && (
                  <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                    Answered
                  </span>
                )}
                <ArrowRight 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} 
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 pt-0">
                      <div className="relative">
                        <Textarea
                          ref={isExpanded ? textareaRef : null}
                          value={displayValue}
                          onChange={(e) => {
                            if (!isRecording) {
                              handleAnswerChange(index, e.target.value);
                            }
                          }}
                          readOnly={isRecording}
                          placeholder="Type your answer or click the mic to speak..."
                          className={cn(
                            "min-h-[80px] text-sm resize-none pr-12",
                            isRecording && "bg-accent/10 border-accent"
                          )}
                        />
                        {speechSupported && (
                          <Button
                            type="button"
                            variant={isRecording ? "default" : "ghost"}
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRecording(index);
                            }}
                            className={cn(
                              "absolute right-2 top-2 h-8 w-8 transition-all",
                              isRecording && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            )}
                          >
                            {isRecording ? (
                              <Stop weight="fill" className="h-4 w-4" />
                            ) : (
                              <Microphone weight="duotone" className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {isRecording && (
                        <div className="mt-2 p-2 bg-accent/5 rounded-lg border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-accent">Listening...</span>
                          </div>
                          <AudioWaveform audioLevel={audioLevel} isActive={isRecording} />
                        </div>
                      )}

                      {speechSupported && !isRecording && (
                        <div className="flex items-center gap-2 mt-2">
                          <Select 
                            value={speechLanguage} 
                            onValueChange={onSpeechLanguageChange}
                          >
                            <SelectTrigger className="h-7 text-xs w-[140px]">
                              <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                              {SPEECH_LANGUAGES.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code} className="text-xs">
                                  <span className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-xs text-muted-foreground">for voice</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {hasAnyAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-accent/20"
        >
          <Button
            onClick={handleSubmit}
            disabled={isRegenerating}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isRegenerating ? (
              <>
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                Improving story...
              </>
            ) : (
              <>
                <PaperPlaneTilt className="mr-2 h-4 w-4" weight="fill" />
                Improve story with {answeredCount} answer{answeredCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
