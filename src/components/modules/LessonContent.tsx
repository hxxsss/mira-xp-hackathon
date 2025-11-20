interface LessonContentProps {
  lesson: {
    title: string;
    content?: string;
    illustration?: string;
  };
}

export const LessonContent = ({ lesson }: LessonContentProps) => {
  return (
    <div className="space-y-6">
      {lesson.illustration && (
        <div className="flex justify-center">
          <div className="text-9xl animate-bounce-slow">{lesson.illustration}</div>
        </div>
      )}
      
      {lesson.content && (
        <div className="prose prose-lg max-w-none">
          {lesson.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-lg leading-relaxed mb-4 text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
