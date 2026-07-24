import { useRouter } from 'next/navigation';

export function useNavigate() {
  const router = useRouter();
  return (path: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      router.replace(path);
    } else {
      router.push(path);
    }
  };
}
