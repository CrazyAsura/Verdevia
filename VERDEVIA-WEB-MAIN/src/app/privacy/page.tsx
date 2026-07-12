import { redirect } from 'next/navigation';

export default async function PrivacyRedirectPage(props: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const searchParams = await props.searchParams;
  const tab = typeof searchParams.tab === 'string' ? `?tab=${searchParams.tab}` : '';
  redirect(`/privacidade${tab}`);
}
