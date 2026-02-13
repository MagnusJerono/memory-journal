import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Microphone, Stop, PaperPlaneTilt, ChatCircleDots, Spinner, ArrowRight, ArrowsClockwise, Plus } from '@phosphor-icons/react';
import { useSpeechToText } from '@/hooks/use-speech-to-text';
import { AudioWaveform } from './AudioWaveform';
import { cn, formatDuration } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

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

const MEMORY_PROMPTS = [
  "Who else was there with you?",
  "What was the weather like?",
  "What sounds do you remember hearing?",
  "What were you wearing?",
  "What smells come to mind?",
  "What emotions were you feeling?",
  "What was playing in the background (music, TV)?",
  "What did you eat or drink?",
  "What time of day was it?",
  "What were you doing just before this moment?",
  "What happened right after?",
  "What made this moment special?",
  "Was there anything funny that happened?",
  "Who took the photos?",
  "What conversations do you remember?",
  "What surprised you?",
  "Was there anything you were worried about?",
  "What were you celebrating?",
  "How did you get there?",
  "What was the first thing you noticed?",
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
  transcript?: string | null;
}

export function RefinementPanel({
  questions,
  speechLanguage,
  onSpeechLanguageChange,
  onSubmitAnswers,
  isRegenerating,
  isLocked,
  transcript
}: RefinementPanelProps) {
  const { isDarkMode } = useTheme();
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [activeRecordingIndex, setActiveRecordingIndex] = useState<number | null>(null);
  const [extraPrompts, setExtraPrompts] = useState<string[]>([]);
  const [usedPromptIndices, setUsedPromptIndices] = useState<Set<number>>(new Set());
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isListening,
    isSupported: speechSupported,
    transcript: speechTranscript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    audioLevel,
    recordingDuration,
    getFrequencyData
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
    const allQuestions = [...questions, ...extraPrompts];
    const answeredQuestions: QuestionAnswer[] = allQuestions
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

  const getMorePrompts = async () => {
    setIsLoadingMore(true);
    
    const availablePrompts = MEMORY_PROMPTS.filter((_, idx) => !usedPromptIndices.has(idx));
    
    if (availablePrompts.length >= 3) {
      const shuffled = [...availablePrompts].sort(() => Math.random() - 0.5);
      const newPrompts = shuffled.slice(0, 3);
      const newIndices = newPrompts.map(p => MEMORY_PROMPTS.indexOf(p));
      
      setExtraPrompts(prev => [...prev, ...newPrompts]);
      setUsedPromptIndices(prev => {
        const updated = new Set(prev);
        newIndices.forEach(i => updated.add(i));
        return updated;
      });
      setIsLoadingMore(false);
    } else {
      try {
        const contextPrompt = transcript 
          ? `Based on this memory: "${transcript.slice(0, 500)}..."` 
          : 'For a personal memory journal entry';
        
        const existingQuestionsStr = [...questions, ...extraPrompts].join(', ');
        
        const fullPrompt = `${contextPrompt}

Generate 3 thoughtful questions to help someone recall more details about this memory. Focus on sensory details, emotions, people, and specific moments.

The questions should be:
- Personal and warm, not clinical
- Specific enough to trigger memories
- Different from these already asked questions: ${existingQuestionsStr}

Return ONLY valid JSON in this format:
{
  "questions": ["Question 1?", "Question 2?", "Question 3?"]
}`;
        
        const response = await window.spark.llm(fullPrompt, 'gpt-4o-mini', true);
        const result = JSON.parse(response) as { questions: string[] };
        
        if (result.questions && Array.isArray(result.questions)) {
          setExtraPrompts(prev => [...prev, ...result.questions.slice(0, 3)]);
        }
      } catch (error) {
        console.error('Failed to generate more prompts:', error);
        const fallbackPrompts = MEMORY_PROMPTS
          .filter((_, idx) => !usedPromptIndices.has(idx))
          .slice(0, 3);
        if (fallbackPrompts.length > 0) {
          setExtraPrompts(prev => [...prev, ...fallbackPrompts]);
        }
      }
      setIsLoadingMore(false);
    }
  };

  const hasAnyAnswer = Object.values(answers).some(a => a.trim().length > 0);
  const answeredCount = Object.values(answers).filter(a => a.trim().length > 0).length;
  const allQuestions = [...questions, ...extraPrompts];

  if (isLocked) {
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
        {allQuestions.map((question, index) => {
          const isExpanded = expandedQuestion === index;
          const isRecording = isListening && activeRecordingIndex === index;
          const hasAnswer = (answers[index] || '').trim().length > 0;
          const displayValue = isRecording 
            ? (answers[index] || '') + ((answers[index] && interimTranscript) ? ' ' : '') + interimTranscript
            : (answers[index] || '');
          const isExtraPrompt = index >= questions.length;

          return (
            <motion.div
              key={`${question}-${index}`}
              layout
              initial={isExtraPrompt ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
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

                      <AnimatePresence>
                        {isRecording && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="mt-3 p-3 sm:p-4 bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-2xl border-2 border-violet-500/30 shadow-lg relative overflow-hidden"
                            style={{
                              boxShadow: '0 0 20px rgba(139, 92, 246, 0.15)',
                              animation: 'pulse-glow 2s ease-in-out infinite'
                            }}
                          >
                            {/* Animated background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/10 to-pink-400/5 animate-pulse opacity-50" />
                            
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse shadow-lg" 
                                        style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)' }} />
                                  <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">Recording</span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {formatDuration(recordingDuration)}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleRecording(index)}
                                  className="bg-violet-500 hover:bg-violet-600 text-white shadow-md h-7 px-3 text-xs"
                                  aria-label="Stop recording"
                                >
                                  <Stop weight="fill" className="h-3.5 w-3.5 mr-1.5" />
                                  Stop
                                </Button>
                              </div>
                              
                              <AudioWaveform 
                                audioLevel={audioLevel} 
                                isActive={isRecording}
                                height={60}
                                isDarkMode={isDarkMode}
                                getFrequencyData={getFrequencyData}
                                className="mb-2"
                              />
                              
                              {/* Show interim transcript in real-time */}
                              {interimTranscript && (
                                <motion.div 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="p-2 bg-background/80 backdrop-blur-sm rounded-md border border-accent/20 mt-2"
                                >
                                  <p className="text-xs text-muted-foreground mb-0.5">Live transcript:</p>
                                  <p className="text-xs text-foreground/80 italic">{interimTranscript}</p>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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

      <div className="mt-4 pt-3 border-t border-accent/20">
        <Button
          variant="ghost"
          size="sm"
          onClick={getMorePrompts}
          disabled={isLoadingMore}
          className="w-full text-xs text-muted-foreground hover:text-foreground"
        >
          {isLoadingMore ? (
            <>
              <Spinner className="mr-2 h-3.5 w-3.5 animate-spin" />
              Getting more questions...
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Show more questions to help remember
              <ArrowsClockwise className="ml-1.5 h-3.5 w-3.5" />
            </>
          )}
        </Button>
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
