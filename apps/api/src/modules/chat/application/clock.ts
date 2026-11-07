/** Port de l'horloge : l'heure d'envoi du message, remplacée dans les tests pour la fixer. */
export abstract class Clock {
  abstract now(): Date;
}
