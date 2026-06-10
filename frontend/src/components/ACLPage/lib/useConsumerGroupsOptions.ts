import useFts from 'components/common/Fts/useFts';
import { useConsumerGroups } from 'lib/hooks/api/consumers';
import { useMemo } from 'react';

const useConsumerGroupsOptions = (clusterName: string, perPage?: number) => {
  const { isFtsEnabled } = useFts('consumer_groups');
  const { data } = useConsumerGroups({
    clusterName,
    perPage,
    search: '',
    fts: isFtsEnabled,
  });
  const consumerGroups = useMemo(() => {
    return (
      data?.consumerGroups?.map((cg) => {
        return {
          value: cg.groupId,
          label: cg.groupId,
        };
      }) || []
    );
  }, [data]);

  return consumerGroups;
};

export default useConsumerGroupsOptions;
