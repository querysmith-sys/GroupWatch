
import { notFound } from "next/navigation"
import WatchPage from "./WatchClient";

export default async function Page({params}: {params: Promise<{id: string}>}) {
    
        const { id } =  await params;
        const res = await fetch("http://localhost:4000/api/checkId", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ roomId: id })
        })

        const data = await res.json();
        console.log(data)
        if (!data.roomExist) {
            notFound();
        }
        return <WatchPage />
}