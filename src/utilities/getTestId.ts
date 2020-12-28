import {IS_CYPRESS_ENVIRONMENT} from '../constants'

export default function getTestId(value: string) {
  return IS_CYPRESS_ENVIRONMENT && value ? {'data-cy': value} : {}
}
