import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '../api';
import type { DocumentType } from '../types';

export function useDocuments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['my-documents'],
    queryFn: documentsApi.getDocuments,
  });

  const generate = useMutation({
    mutationFn: (type: DocumentType) => documentsApi.generateDocument(type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-documents'] }),
  });

  return { ...query, generate };
}
