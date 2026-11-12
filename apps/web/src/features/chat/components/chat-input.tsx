import { CHAT_MESSAGE_MAX_LENGTH } from '@joj/shared';
import { type FormEvent, useState } from 'react';
import { SendIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ChatInputProps {
  /** Renvoie `false` si le message n'est pas parti : la saisie est alors gardée. */
  onSend: (text: string) => boolean;
  pending: boolean;
}

/**
 * La zone de saisie, collée au bas de l'écran comme dans une messagerie. Sur téléphone, elle se
 * pose juste au-dessus des onglets fixés en bas.
 */
export function ChatInput({ onSend, pending }: ChatInputProps) {
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onSend(draft)) setDraft('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 flex items-center gap-2 border-t border-black/10 bg-background/95 px-4 py-3 backdrop-blur-md sm:bottom-0 sm:-mx-8 sm:px-8"
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
        className="h-12 flex-1 rounded-full border-2 border-black/15 bg-muted px-5 text-base focus-visible:border-joj-green"
      />
      <Button
        type="submit"
        disabled={pending}
        className="size-12 shrink-0 rounded-full bg-joj-green p-0 text-white shadow-md transition-transform hover:bg-joj-green-deep active:scale-95"
      >
        <SendIcon className="size-5" />
        <span className="sr-only">Envoyer</span>
      </Button>
    </form>
  );
}
