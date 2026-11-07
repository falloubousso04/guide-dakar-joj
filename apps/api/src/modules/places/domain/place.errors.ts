import { AppError, type ErrorKind } from '../../../core/errors/app-error';

const PLACE_ERROR_KINDS = {
  PLACE_NAME_REQUIRED: 'VALIDATION',
  PLACE_VISIT_MINUTES_INVALID: 'VALIDATION',
  PLACE_NOT_FOUND: 'NOT_FOUND',
} as const satisfies Record<string, ErrorKind>;

export type PlaceErrorCode = keyof typeof PLACE_ERROR_KINDS;

export class PlaceError extends AppError<PlaceErrorCode> {
  constructor(code: PlaceErrorCode, message: string) {
    super(code, PLACE_ERROR_KINDS[code], message);
  }
}
