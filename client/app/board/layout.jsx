import { Layout_App } from "components/app"
import { Board_Menu } from "components/board"

export default async function Layout({children}){
    return(<>
        <Board_Menu app='board'/>
        <Layout_App>{children}</Layout_App>
    </>)
}