import React, { FC, useContext, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateProducerAcl } from 'lib/hooks/api/acl';
import { FormProvider, useForm } from 'react-hook-form';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterName } from 'lib/interfaces/cluster';
import Input from 'components/common/Input/Input';
import ControlledMultiSelect from 'components/common/MultiSelect/ControlledMultiSelect';
import Checkbox from 'components/common/Checkbox/Checkbox';
import * as S from 'components/ACLPage/Form/Form.styled';
import { AclDetailedFormProps, MatchType } from 'components/ACLPage/Form/types';
import useTopicsOptions from 'components/ACLPage/lib/useTopicsOptions';
import ACLFormContext from 'components/ACLPage/Form/AclFormContext';
import MatchTypeSelector from 'components/ACLPage/Form/components/MatchTypeSelector';
import { useClusters } from 'lib/hooks/api/clusters';

import { toRequest } from './lib';
import { FormValues } from './types';
import formSchema from './schema';

const ForProducersForm: FC<AclDetailedFormProps> = ({ formRef }) => {
  const context = useContext(ACLFormContext);
  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
  });
  const { setValue, watch } = methods;

  const addAllTopicsChecked = watch('addAllTopics');
  const [showTopicsError, setShowTopicsError] = useState(false);

  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const create = useCreateProducerAcl(clusterName);

  const { data: clusters } = useClusters();
  const currentCluster = clusters?.find((c) => c.name === clusterName);
  const topicCount = currentCluster?.topicCount ?? 0;

  const topics = useTopicsOptions(clusterName, topicCount);

  const onTopicTypeChange = (value: string) => {
    if (value === MatchType.EXACT) {
      setValue('topicsPrefix', undefined);
    } else {
      setValue('topics', undefined);
    }
  };

  const onTransactionIdTypeChange = (value: string) => {
    if (value === MatchType.EXACT) {
      setValue('transactionsIdPrefix', undefined);
    } else {
      setValue('transactionalId', undefined);
    }
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      const data = { ...formData };

      const selectedTopics = data.topics || [];
      const { topicsPrefix } = data;
      const allTopicsSelected =
        selectedTopics.length === topics.length && topics.length !== 0;

      if (selectedTopics.length === 0 && !data.addAllTopics && !topicsPrefix) {
        setShowTopicsError(true);
        return;
      }

      setShowTopicsError(false);

      if (allTopicsSelected || data.addAllTopics) {
        data.topics = [{ value: '*', label: 'All Topics' }];
        data.topicsPrefix = undefined;
      }

      await create.createResource(toRequest(data));
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
          <S.Label>To Topic(s)</S.Label>
          <S.ControlList>
            <MatchTypeSelector
              exact={<ControlledMultiSelect name="topics" options={topics} />}
              prefixed={<Input name="topicsPrefix" placeholder="Prefix..." />}
              onChange={onTopicTypeChange}
            />
          </S.ControlList>
        </S.Field>

        {topicCount === 0 && (
          <Checkbox
            name="addAllTopics"
            label="Add ACL for all future created topics"
            hint="Note: You don't have any topics; check this box to add ACLs for future topics"
          />
        )}
        {showTopicsError && !addAllTopicsChecked && (
          <span style={{ fontSize: '0.9rem', color: '#E51A1A' }}>
            Please select at least one topic
          </span>
        )}

        <S.Field>
          <S.Field>Transaction ID</S.Field>
          <S.ControlList>
            <MatchTypeSelector
              exact={
                <Input name="transactionalId" placeholder="Transactional ID" />
              }
              prefixed={
                <Input name="transactionsIdPrefix" placeholder="Prefix..." />
              }
              onChange={onTransactionIdTypeChange}
            />
          </S.ControlList>
          <span style={{ fontSize: '0.9rem', color: '#8c8c8c' }}>
            Optional: leave empty to allow all transaction IDs
          </span>
        </S.Field>
        <hr />
        <Checkbox
          name="idempotent"
          label="Idempotent"
          hint="Check it if using enable idempotence=true"
        />
      </S.Form>
    </FormProvider>
  );
};

export default ForProducersForm;
