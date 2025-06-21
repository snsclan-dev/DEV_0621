export const $META = {
    width: "device-width", initialScale: 1, maximumScale: 2,
    app_name: "연구소",
    app_url: process.env.NEXT_PUBLIC_APP_URL,
    description: "연구소에 오신것을 환영합니다.",
};
export const getMetadata = (data) => {
    const { title, image, description, search, link, asPath, ogImage } = data || {};
    
    const $TITLE = title ? `${title} - ${$META.app_name}` : search ? `${search} - ${$META.app_name}` : $META.app_name;
    const $DESC = description || $META.description;
    // const PAGE_URL = asPath ? asPath : '';
    // const $OG_IMAGE = ogImage || $META.ogImage;

    const metadata = {
        metadataBase: new URL($META.app_url),
        // alternates: { canonical: PAGE_URL, },
        title: $TITLE,
        description: $DESC,
        keywords: $META.keywords,
        openGraph: {
            title: $TITLE,
            description: $DESC,
            siteName: $TITLE,
            locale: 'ko_KR',
            type: 'website',
            // url: link,
            images: { url: image, },
        },
    };
    return metadata;
};