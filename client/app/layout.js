import Script from "next/script";
import localFont from "next/font/local";
import { getMetadata } from "modules/META";
import { fetchInfo, fetchUser } from "modules/FETCH";
import { App_Dev, App_Footer, App_Header } from "components/app";

import "./globals.css";
import "components/app/app.css";
import "components/board/board.css"

const notoSans = localFont({
    src: [
        { path: "./fonts/NotoSansKR-Regular.woff2", weight: "400", style: "normal" },
        { path: "./fonts/NotoSansKR-Bold.woff2", weight: "700", style: "bold" },
    ],
})
export const generateMetadata = () => {
    return getMetadata();
};
export default async function RootLayout({ children }) {
    const $INFO = await fetchInfo()
    const $USER = await fetchUser()
    // const $MAP = process.env.NODE_ENV === 'production' && checkAdmin($USER.level) ? true : false
    const $MAP = false ///
    // const $MAP = true ///

    return (<html lang="ko">
        {$MAP && <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP}&libraries=clusterer,services&autoload=false`}/>}
        <body className={notoSans.className}>
            {process.env.NODE_ENV === 'development' && <App_Dev/>}
            <App_Header info={$INFO} user={$USER}/>
            <main>{children}</main>
            <div className="main_bottom"></div>
            <App_Footer />
        </body>
    </html>);
}
