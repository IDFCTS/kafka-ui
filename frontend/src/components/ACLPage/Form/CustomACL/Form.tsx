import React, { FC, useContext, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useCreateCustomAcl } from 'lib/hooks/api/acl';
import ControlledRadio from 'components/common/Radio/ControlledRadio';
import Input from 'components/common/Input/Input';
import ControlledSelect from 'components/common/Select/ControlledSelect';
import { matchTypeOptions } from 'components/ACLPage/Form/constants';
import useAppParams from 'lib/hooks/useAppParams';
import * as S from 'components/ACLPage/Form/Form.styled';
import ACLFormContext from 'components/ACLPage/Form/AclFormContext';
import { AclDetailedFormProps } from 'components/ACLPage/Form/types';
import { ClusterName } from 'lib/interfaces/cluster';

import formSchema from './schema';
import { FormValues } from './types';
import { toRequest } from './lib';
import {
  defaultValues,
  permissions,
  resourceTypes,
  getOperationOptions,
} from './constants';

/**
 * Renders the permission + operation controls. Kept as a separate component so
 * that the `resourceType` / `namePatternType` subscriptions live here and not in
 * the parent that renders the `namePatternType` radio — `ControlledRadio` fires
 * `onChange` on every render, so subscribing to its field in the same component
 * would create a render loop.
 */
const OperationControls: FC = () => {
  const { control, getValues, setValue } = useFormContext<FormValues>();
  const resourceType = useWatch({ control, name: 'resourceType' });
  const namePatternType = useWatch({ control, name: 'namePatternType' });
  const operationOptions = getOperationOptions(resourceType, namePatternType);

  // Reset the selected operation whenever it is no longer valid for the current
  // resource type / pattern combination (e.g. DELETE was picked under PREFIXED
  // and the pattern was switched back to EXACT). Without this the Select shows a
  // blank value while the form would still submit the stale operation.
  useEffect(() => {
    const current = getValues('operation');
    if (!operationOptions.some((option) => option.value === current)) {
      setValue('operation', operationOptions[0]?.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceType, namePatternType]);

  return (
    <S.ControlList>
      <ControlledRadio name="permission" options={permissions} />
      <ControlledSelect options={operationOptions} name="operation" />
    </S.ControlList>
  );
};

const CustomACLForm: FC<AclDetailedFormProps> = ({ formRef }) => {
  const context = useContext(ACLFormContext);

  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: { ...defaultValues },
  });

  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const create = useCreateCustomAcl(clusterName);

  const onSubmit = async (data: FormValues) => {
    try {
      const resource = toRequest(data);
      await create.createResource(resource);
      context?.close();
    } catch (e) {
      // no custom error
    }
  };

  return (
    <FormProvider {...methods}>
      <S.Form ref={formRef} onSubmit={methods.handleSubmit(onSubmit)}>
        <hr />
        <S.Field>
          <S.Label htmlFor="principal">Principal</S.Label>
          <Input
            name="principal"
            id="principal"
            placeholder="Principal"
            withError
          />
        </S.Field>

        <S.Field>
          <S.Label htmlFor="host">Host restriction</S.Label>
          <Input name="host" id="host" placeholder="Host" withError />
        </S.Field>
        <hr />

        <S.Field>
          <S.Label htmlFor="resourceType">Resource type</S.Label>
          <ControlledSelect options={resourceTypes} name="resourceType" />
        </S.Field>

        <S.Field>
          <S.Label>Operations</S.Label>
          <OperationControls />
        </S.Field>

        <S.Field>
          <S.Field>Matching pattern</S.Field>
          <S.ControlList>
            <ControlledRadio
              name="namePatternType"
              options={matchTypeOptions}
            />
            <Input
              name="resourceName"
              id="resourceName"
              placeholder="Matching pattern"
              withError
            />
          </S.ControlList>
        </S.Field>
      </S.Form>
    </FormProvider>
  );
};

export default React.memo(CustomACLForm);
