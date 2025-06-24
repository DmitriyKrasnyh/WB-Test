// src/hooks/useNProgress.ts
import { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, trickleSpeed: 150 });

export const useNProgress = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  useEffect(() => {
    if (isFetching + isMutating > 0) NProgress.start();
    else NProgress.done();
  }, [isFetching, isMutating]);
};
