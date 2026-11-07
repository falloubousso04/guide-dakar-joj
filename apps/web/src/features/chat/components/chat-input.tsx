import { CHAT_MESSAGE_MAX_LENGTH } from '@joj/shared';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChatInputProps {
  /** Renvoie `false` si le message n'est pas parti : la saisie est alors gardée. */
  onSend: (text: string) => boolean;
  pending: boolean;
}

/** La zone de saisie, fixée en bas de l'écran. */
export function ChatInput({ onSend, pending }: ChatInputProps) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onSend(draft)) setDraft('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 flex gap-2 border-t-2 border-foreground bg-background pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <Label htmlFor="chat-message" className="sr-only">
        Votre message
      </Label>
      <Input
        id="chat-message"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        maxLength={CHAT_MESSAGE_MAX_LENGTH}
        autoComplete="off"
        placeholder="Où êtes-vous, à quelle heure est votre épreuve ?"
        className="h-11 rounded-none border-2 border-foreground"
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-none px-5 font-bold uppercase"
      >
        Envoyer
      </Button>
    </form>
  );
}
