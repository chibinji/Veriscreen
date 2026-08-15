interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <strong>Something went wrong</strong>
      <p>{message}</p>
    </div>
  );
}
