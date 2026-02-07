import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/board',
      permanent: false,
    },
  };
};

export default function Index() {
  return null;
}

