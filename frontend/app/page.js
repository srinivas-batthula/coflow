import HomePage from '@/components/Home'


export default async function HPage() {
    let response
    try {
        const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/hackathons");
        if (res.ok){
            response = await res.json();
        }
    } catch (err) {
        console.error('Error while fetching Hackathons!')
    }

    return (
        <div>
            <HomePage hackathonsList={response.data || []} />
        </div>
    )
}