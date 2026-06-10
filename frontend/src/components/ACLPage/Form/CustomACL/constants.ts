import { SelectOption } from 'components/common/Select/Select';
import {
  KafkaAclOperationEnum,
  KafkaAclPermissionEnum,
  KafkaAclResourceType,
} from 'generated-sources';
import { RadioOption } from 'components/common/Radio/types';

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
  operation: resourceTypeOperationsMap[defaultResourceType][0]
    .value as KafkaAclOperationEnum,
};
