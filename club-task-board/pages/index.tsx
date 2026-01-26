import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { User } from '../src/types';

interface IndexProps {
  currentUser: User;
}

export default function Index({ currentUser }: IndexProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace('/board');
  }, [router]);

  return null;
}
