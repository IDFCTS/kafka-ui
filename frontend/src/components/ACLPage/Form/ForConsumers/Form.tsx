import React, { FC, useContext, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { ClusterName } from 'lib/interfaces/cluster';
import { useCreateConsumersAcl } from 'lib/hooks/api/acl';
import useAppParams from 'lib/hooks/useAppParams';
import ControlledMultiSelect from 'components/common/MultiSelect/ControlledMultiSelect';
import Input from 'components/common/Input/Input';
import * as S from 'components/ACLPage/Form/Form.styled';
import { AclDetailedFormProps, MatchType } from 'components/ACLPage/Form/types';
import useTopicsOptions from 'components/ACLPage/lib/useTopicsOptions';
import useConsumerGroupsOptions from 'components/ACLPage/lib/useConsumerGroupsOptions';
import ACLFormContext from 'components/ACLPage/Form/AclFormContext';
import MatchTypeSelector from 'components/ACLPage/Form/components/MatchTypeSelector';
import Checkbox from 'components/common/Checkbox/Checkbox';
import { useClusters } from 'lib/hooks/api/clusters';

import formSchema from './schema';
import { toRequest } from './lib';
import { FormValues } from './types';

const ForConsumersForm: FC<AclDetailedFormProps> = ({ formRef }) => {
  const context = useContext(ACLFormContext);
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const create = useCreateConsumersAcl(clusterName);
  const methods = useForm<FormValues>({
    mode: 'all',
    resolver: yupResolver(formSchema),
  });

  const { setValue, watch } = methods;

  const addAllTopicsChecked = watch('addAllTopics');
  const [showTopicsError, setShowTopicsError] = useState(false);

  const { data: clusters } = useClusters();
  const currentCluster = clusters?.find((c) => c.name === clusterName);
  const topicCount = currentCluster?.topicCount ?? 0;

  const onSubmit = async (formData: FormValues) => {
    try {
      const data = { ...formData };

      const selectedTopics = data.topics || [];
      const { topicsPrefix } = data;
      const allTopicsSelected =
        selectedTopics.length === topics.length && topics.length !== 0;

      const { consumerGroups: selectedConsumerGroup } = data;
      const allConsumerGroupsSelected =
        selectedConsumerGroup?.length === consumerGroups.length &&
        consumerGroups.length !== 0;

      if (
        selectedTopics.length === 0 &&
        !data.addAllTopics &&
        !topicsPrefix
      ) {
        setShowTopicsError(true);
        return;
      }

      setShowTopicsError(false);

      if (allTopicsSelected || data.addAllTopics) {
        data.topics = [{ value: '*', label: 'All Topics' }];
        data.topicsPrefix = undefined;
      }

      if (allConsumerGroupsSelected || data.addAllConsumerGroups) {
        data.consumerGroups = [{ value: '*', label: 'All Consumer groups' }];
        data.consumerGroupsPrefix = undefined;
      }

      await create.createResource(toRequest(data));
      context?.close();
    } catch (e) {
      // no custom error
    }
  };

  const topics = useTopicsOptions(clusterName, topicCount || 1000);
  const consumerGroups = useConsumerGroupsOptions(clusterName, 1000);
  const consumerCount = consumerGroups.length;

  const onTopicTypeChange = (value: string) => {
    if (value === MatchType.EXACT) {
      setValue('topicsPrefix', undefined);
    } else {
      setValue('topics', undefined);
    }
  };

  const onConsumerGroupTypeChange = (value: string) => {
    if (value === MatchType.EXACT) {
      setValue('consumerGroupsPrefix', undefined);
    } else {
      setValue('consumerGroups', undefined);
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
          <S.Label>From Topic(s)</S.Label>
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
        <hr />

        <S.Field>
          <S.Field>Consumer group(s)</S.Field>
          <S.ControlList>
            <MatchTypeSelector
              exact={
                <ControlledMultiSelect
                  name="consumerGroups"
                  options={consumerGroups}
                />
              }
              prefixed={
                <Input name="consumerGroupsPrefix" placeholder="Prefix..." />
              }
              onChange={onConsumerGroupTypeChange}
            />
          </S.ControlList>
        </S.Field>

        {consumerCount === 0 && (
          <Checkbox
            name="addAllConsumerGroups"
            label="Add ACL for all consumer groups"
            hint="Note: You don't have any consumer groups; check this box to add ACLs for future created consumer groups"
          />
        )}
      </S.Form>
    </FormProvider>
  );
};

export default React.memo(ForConsumersForm);
