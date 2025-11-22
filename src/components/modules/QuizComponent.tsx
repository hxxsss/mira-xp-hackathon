import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  question: string;
  hint?: string;
  options: string[];
  correct: number;
  justifications?: {
    [key: number]: {
      type: 'correct' | 'incorrect';
      text: string;
    };
  };
}

interface QuizComponentProps {
  lesson: {
    questions?: Question[];
  };
  onSubmit: (answers: number[]) => void;
  onRetry?: () => void;
}

export const QuizComponent = ({ lesson, onSubmit, onRetry }: QuizComponentProps) => {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentJustification, setCurrentJustification] = useState('');

  if (!lesson.questions || lesson.questions.length === 0) {
    return <div>Nenhuma pergunta disponível</div>;
  }

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lesson.questions.length - 1;
  const selectedAnswer = answers[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    if (hasAnswered) return; // Não permite mudar resposta após confirmar
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === undefined) return;

    const correct = selectedAnswer === currentQuestion.correct;
    setIsCorrect(correct);
    setHasAnswered(true);

    // Buscar justificativa para a resposta selecionada
    if (currentQuestion.justifications && currentQuestion.justifications[selectedAnswer]) {
      setCurrentJustification(currentQuestion.justifications[selectedAnswer].text);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit all answers
      onSubmit(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setHasAnswered(false);
      setShowHint(false);
      setCurrentJustification('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setHasAnswered(false);
      setShowHint(false);
      setCurrentJustification('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 relative">
        {/* Botão de Dica */}
        {currentQuestion.hint && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHint(!showHint)}
            className="absolute top-4 right-4 gap-2 bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400"
          >
            <Lightbulb className="w-4 h-4" />
            Dica
          </Button>
        )}

        <div className="mb-4">
          <span className="text-sm text-muted-foreground">
            Pergunta {currentQuestionIndex + 1} de {lesson.questions.length}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-6 pr-20">{currentQuestion.question}</h3>

        {/* Área de Dica */}
        {showHint && currentQuestion.hint && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-600">
            <Lightbulb className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-300">
              {currentQuestion.hint}
            </AlertDescription>
          </Alert>
        )}

        <RadioGroup 
          value={selectedAnswer?.toString()} 
          onValueChange={(value) => {
            if (!hasAnswered) {
              handleAnswerSelect(parseInt(value));
            }
          }}
          disabled={hasAnswered}
        >
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Card 
                key={index} 
                className={`p-4 cursor-pointer transition-all ${
                  hasAnswered
                    ? index === currentQuestion.correct
                      ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950/20'
                      : index === selectedAnswer
                      ? 'border-2 border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-2 border-transparent opacity-50'
                    : selectedAnswer === index 
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/20' 
                      : 'border-2 border-transparent hover:shadow-md'
                }`}
                onClick={() => !hasAnswered && handleAnswerSelect(index)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`}
                    disabled={hasAnswered}
                  />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                  {hasAnswered && index === currentQuestion.correct && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {hasAnswered && index === selectedAnswer && index !== currentQuestion.correct && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>

        {/* Feedback após responder */}
        {hasAnswered && currentJustification && (
          <Alert className={`mt-6 ${
            isCorrect 
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 dark:from-green-950/20 dark:to-green-900/20 dark:border-green-600' 
              : 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-600'
          } border-2 animate-in fade-in slide-in-from-top-2 duration-300`}>
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-green-700 dark:text-green-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-700 dark:text-red-400" />
            )}
            <div>
              <div className={`font-bold mb-2 ${
                isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {isCorrect ? '✅ Parabéns! Você acertou!' : '❌ Resposta incorreta'}
              </div>
              <AlertDescription className={
                isCorrect ? 'text-green-900 dark:text-green-200' : 'text-red-900 dark:text-red-200'
              }>
                {currentJustification}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        {!hasAnswered ? (
          <Button
            onClick={handleConfirmAnswer}
            disabled={selectedAnswer === undefined}
            className="bg-primary hover:bg-primary/90"
          >
            Confirmar Resposta
          </Button>
        ) : (
          <>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                className="gap-2"
              >
                Tentar Novamente
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90"
            >
              {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Pergunta'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
