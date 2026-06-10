import { useTopics } from 'lib/hooks/api/topics';
import { useMemo } from 'react';

const useTopicsOptions = (clusterName: string, topicCount?: number) => {
  const { data } = useTopics({ clusterName, perPage: topicCount });
  const topics = useMemo(() => {
    return (
      data?.topics?.map((topic) => {
        return {
          label: topic.name,
          value: topic.name,
        };
      }) || []
    );
  }, [data]);

  return topics;
};

export default useTopicsOptions;
