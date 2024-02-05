import React, { ReactNode } from 'react';
import { ClipLoader } from 'react-spinners';

interface Prop {
  data?: any[];
  isLoading: boolean;
  children: ReactNode;
  empty: ReactNode;
}

export const Loader = ({ data, isLoading, children, empty }: Prop): JSX.Element => {
  if (isLoading) return <ClipLoader className="loader" color={'#000'} loading={true} size={150} />;

  if (data === undefined || data.length === 0) return <>{empty}</>;
  return <>{children}</>;
};
