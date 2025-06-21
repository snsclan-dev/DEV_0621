export const Layout_App = ({children})=>{
    return(<div className="layout_none">{children}</div>)
}
// export const Layout_None = ({children})=>{
//     return(<div className="layout_none">{children}</div>)
// }
// export const Layout_App = ({children})=>{
//     return(<div className="layout_app">
//         <div className="layout_main">{children}</div>
//         <div className="layout_banner">
//             <div className="layout_ads">
//                 <iframe className="ads_coupang_right" src="https://ads-partners.coupang.com/widgets.html?id=777866&template=carousel&trackingCode=AF4642888&subId=&tsource=" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" browsingtopics="true"></iframe>
//             </div>
//         </div>
//     </div>)
// }
// export const Layout_Ads = ({type})=>{
//     return <iframe className={`ads_coupang_${type}`} src="https://ads-partners.coupang.com/widgets.html?id=777840&template=carousel&trackingCode=AF4642888&subId=&tsource=" frameBorder="0" scrolling="no" referrerPolicy="unsafe-url" browsingtopics="true"></iframe>
// }