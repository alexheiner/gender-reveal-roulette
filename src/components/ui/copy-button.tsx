import React from 'react';
import { Button, type ButtonProps } from './button';
import { CheckIcon, ClipboardIcon } from 'lucide-react';

interface CopyButtonProps extends ButtonProps {
  value: string;
}

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value);
}

export function CopyButton({ value, children, ...props }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <Button
      onClick={() => {
        copyToClipboardWithMeta(value);
        setHasCopied(true);
      }}
      {...props}
    >
      {hasCopied ? <CheckIcon height={16} /> : <ClipboardIcon height={20} width={20} />}
      {children}
    </Button>
  );
}
