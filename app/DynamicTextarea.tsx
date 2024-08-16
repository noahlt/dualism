import { ChangeEvent, useEffect, useRef } from "react";

export interface DynamicTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export function DynamicTextarea({
  value,
  onChange,
  className,
  ...props
}: DynamicTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      style={{ resize: "none" }}
      className={className}
      value={value}
      rows={1}
      onChange={(evt) => {
        const elt = evt.target;
        elt.style.height = elt.scrollHeight + "px";
        if (onChange) onChange(evt);
      }}
      {...props}
    ></textarea>
  );
}
