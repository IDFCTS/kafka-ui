import { SelectOption } from 'components/common/Select/Select';
import {
  KafkaAclOperationEnum,
  KafkaAclPermissionEnum,
  KafkaAclResourceType,
} from 'generated-sources';
import { RadioOption } from 'components/common/Radio/types';
import { MatchType } from 'components/ACLPage/Form/types';

import { FormValues } from './types';

function toOptionsArray<T extends string>(
  list: T[],
  unknown: T
): SelectOption<T>[] {
  return list.reduce<SelectOption<T>[]>((acc, cur) => {
    if (cur !== unknown) {
      acc.push({ label: cur, value: cur });
    }

    return acc;
  }, []);
}

export const resourceTypes = toOptionsArray(
  Object.values(KafkaAclResourceType).filter(
    (key) =>
      key !== ('DELEGATION_TOKEN' as any) &&
      key !== ('USER' as any)
  ),
  KafkaAclResourceType.UNKNOWN
);

export const operations = toOptionsArray(
  Object.values(KafkaAclOperationEnum),
  KafkaAclOperationEnum.UNKNOWN
);

export const resourceTypeOperationsMap: Record<
  KafkaAclResourceType,
  SelectOption<KafkaAclOperationEnum>[]
> = {
  [KafkaAclResourceType.TOPIC]: toOptionsArray(
    [
      KafkaAclOperationEnum.DESCRIBE,
      KafkaAclOperationEnum.CREATE,
      KafkaAclOperationEnum.WRITE,
      KafkaAclOperationEnum.READ,
      KafkaAclOperationEnum.DESCRIBE_CONFIGS,
    ],
    KafkaAclOperationEnum.UNKNOWN
  ),
  [KafkaAclResourceType.GROUP]: toOptionsArray(
    [KafkaAclOperationEnum.DESCRIBE, KafkaAclOperationEnum.READ],
    KafkaAclOperationEnum.UNKNOWN
  ),
  [KafkaAclResourceType.TRANSACTIONAL_ID]: toOptionsArray(
    [KafkaAclOperationEnum.DESCRIBE, KafkaAclOperationEnum.WRITE],
    KafkaAclOperationEnum.UNKNOWN
  ),
  [KafkaAclResourceType.CLUSTER]: toOptionsArray(
    [KafkaAclOperationEnum.DESCRIBE, KafkaAclOperationEnum.IDEMPOTENT_WRITE],
    KafkaAclOperationEnum.UNKNOWN
  ),
  [KafkaAclResourceType.UNKNOWN]: operations,
  [KafkaAclResourceType.DELEGATION_TOKEN]: operations,
  [KafkaAclResourceType.USER]: operations,
};

/**
 * Operations offered only when the pattern is `PREFIXED` (matching the supported
 * workflow of managing a family of prefix-matched resources), keyed by resource type:
 * - `TOPIC`: `DELETE` and `ALTER_CONFIGS`
 * - `GROUP`: `DELETE`
 */
const prefixedOnlyOperations: Partial<
  Record<KafkaAclResourceType, KafkaAclOperationEnum[]>
> = {
  [KafkaAclResourceType.TOPIC]: [
    KafkaAclOperationEnum.DELETE,
    KafkaAclOperationEnum.ALTER_CONFIGS,
  ],
  [KafkaAclResourceType.GROUP]: [KafkaAclOperationEnum.DELETE],
};

/**
 * Returns the operation options available for a given resource type and matching
 * pattern. The prefixed-only operations (see `prefixedOnlyOperations`) are appended
 * only when the pattern is `PREFIXED`.
 */
export const getOperationOptions = (
  resourceType: KafkaAclResourceType,
  namePatternType?: MatchType
): SelectOption<KafkaAclOperationEnum>[] => {
  const base = resourceTypeOperationsMap[resourceType] ?? [];
  const prefixedOnly = prefixedOnlyOperations[resourceType];
  if (prefixedOnly && namePatternType === MatchType.PREFIXED) {
    return [
      ...base,
      ...prefixedOnly.map((operation) => ({
        label: operation,
        value: operation,
      })),
    ];
  }
  return base;
};

export const permissions: RadioOption[] = [
  {
    value: KafkaAclPermissionEnum.ALLOW,
    itemType: 'green',
  },
  {
    value: KafkaAclPermissionEnum.DENY,
    itemType: 'red',
  },
];

const defaultResourceType = resourceTypes[0].value as KafkaAclResourceType;

export const defaultValues: Partial<FormValues> = {
  resourceType: defaultResourceType,
  namePatternType: MatchType.EXACT,
  operation: resourceTypeOperationsMap[defaultResourceType][0]
    .value as KafkaAclOperationEnum,
};
