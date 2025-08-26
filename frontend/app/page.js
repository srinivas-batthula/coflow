import HomePage from '@/components/Home';

export default async function HPage() {
  // SSR won't work in Netlify (deployment)...
  // let data = []
  // try {
  //   const res = await fetch(
  //     process.env.NEXT_PUBLIC_BACKEND_URL + "/api/hackathons"
  //   );
  //   if (!res.ok) throw new Error("Failed to fetch hackathons");
  //   const response = await res.json();
  //   data = response.data
  // } catch (err) {
  //   console.error(err)
  // }

  return (
    <div>
      <HomePage />
    </div>
  );
}
