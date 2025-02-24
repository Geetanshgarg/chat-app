export const VisuallyHidden = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};