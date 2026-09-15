import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api';
import { useSessionQueryKey } from './useSessionQueryKey';
import type { DocumentType } from '../types';

export function useDocuments() {
  const queryClient = useQueryClient();
  const documentsKey = useSessionQueryKey('my-documents');

  const query = useQuery({
    queryKey: documentsKey,
    queryFn: documentsApi.getDocuments,
  });

  const generate = useMutation({
    mutationFn: (type: DocumentType) => documentsApi.generateDocument(type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-documents'] }),
  });

  return { ...query, generate };
}
