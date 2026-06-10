import React from 'react';

import * as S from './Version.styled';

const Version: React.FC = () => {
  return (
    <S.Wrapper>
      <S.CurrentVersion>v1.5.0</S.CurrentVersion>
    </S.Wrapper>
  );
};

export default Version;
