import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface QuizComponentProps {
  lesson: {
    questions?: Question[];
  };
  onSubmit: (answers: number[]) => void;
}

export const QuizComponent = ({ lesson, onSubmit }: QuizComponentProps) => {
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!lesson.questions || lesson.questions.length === 0) {
    return <div>Nenhuma pergunta disponível</div>;
  }

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lesson.questions.length - 1;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Submit all answers
      onSubmit(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="mb-4">
          <span className="text-sm text-gray-500">
            Pergunta {currentQuestionIndex + 1} de {lesson.questions.length}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>

        <RadioGroup 
          value={answers[currentQuestionIndex]?.toString()} 
          onValueChange={(value) => handleAnswerSelect(parseInt(value))}
        >
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Card 
                key={index} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  answers[currentQuestionIndex] === index 
                    ? 'border-2 border-purple-500 bg-purple-50' 
                    : 'border-2 border-transparent'
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Anterior
        </Button>

        <Button
          onClick={handleNext}
          disabled={answers[currentQuestionIndex] === undefined}
          className="bg-[#7C3AED] hover:bg-[#6D28D9]"
        >
          {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Pergunta'}
        </Button>
      </div>
    </div>
  );
};
