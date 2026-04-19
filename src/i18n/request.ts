import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Read locale from the HTTP cookies, fallback to 'vi'
    const cookieStore = await cookies();
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'vi';

    // Return the messages mapping corresponding to the picked locale
    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});