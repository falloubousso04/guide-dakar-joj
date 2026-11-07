import type { PlaceSuggestion } from '@joj/shared';
import { AssistantBubble, UserBubble } from './chat-bubble';
import { PlaceCard } from './place-card';

/** Un message affiché : celui du supporter, ou la réponse du chatbot avec ses lieux. */
export type ConversationEntry =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; places: PlaceSuggestion[] };

/**
 * La conversation, dans une région `log` : un lecteur d'écran annonce chaque nouveau message
 * sans que le focus quitte la zone de saisie.
 */
export function ChatConversation({ entries }: { entries: ConversationEntry[] }) {
  return (
    <div role="log" aria-label="Conversation" className="flex flex-col">
      {entries.length > 0 && (
        <ol className="flex flex-col gap-4">
          {/* La conversation ne fait que s'allonger : l'indice est une clé stable. */}
          {entries.map((entry, index) => (
            <li key={index} className="flex flex-col gap-3">
              {entry.role === 'user' ? (
                <UserBubble content={entry.content} />
              ) : (
                <>
                  <AssistantBubble>
                    <p className="sr-only">Le chatbot :</p>
                    <p className="break-words whitespace-pre-line">{entry.content}</p>
                  </AssistantBubble>
                  {entry.places.length > 0 && (
                    <ul aria-label="Lieux proposés" className="grid gap-3 sm:grid-cols-2">
                      {entry.places.map((place, placeIndex) => (
                        <PlaceCard key={place.id} place={place} index={placeIndex} />
                      ))}
                    </ul>
                  )}
                </>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
