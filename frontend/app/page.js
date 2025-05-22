import HomePage from "@/components/Home";

export default async function HPage() {
  let response = { success: false };
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/api/hackathons"
    );
    response = await res.json();
  } catch (err) {
    console.log("Error while fetching Hackathons!");
  }

  return (
    <div>
      <HomePage hackathonsList={(response.success) ? response.data : []} />
    </div>
  );
}
